"""
AI Route Intelligence module for GLOBAL-SETU Platform
Implements Dijkstra & Multi-Factor Route Optimization considering distance, travel time, AI risk penalty, and accessibility.
"""
import heapq
import os
import pandas as pd
from flask import Blueprint, request, jsonify
from routes.map_routes import get_live_roads_data

routing_bp = Blueprint('routing', __name__, url_prefix='/api/route')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOCATIONS_CSV = os.path.join(BASE_DIR, 'data', 'locations.csv')

def build_graph(roads, vehicle_type='Heavy Commercial', priority='NORMAL', risk_weight=1.0):
    """
    Builds an adjacency list representation of the NER road network with calculated dynamic weights.
    """
    graph = {}
    
    # Vehicle modifiers
    vehicle_speed_factor = {
        'Heavy Commercial': 0.85,
        'Medium Truck': 1.0,
        'Emergency 4x4': 1.25,
        'Light Relief Van': 1.1
    }.get(vehicle_type, 1.0)

    # Priority risk sensitivity
    priority_mult = {
        'EMERGENCY': 1.6,
        'HIGH': 1.3,
        'NORMAL': 1.0,
        'LOW': 0.8
    }.get(priority, 1.0)

    for road in roads:
        src = road['source']
        dst = road['destination']
        dist = float(road['distance_km'])
        base_speed = float(road.get('speed_limit_kmh', 50)) * vehicle_speed_factor
        travel_time_hours = dist / max(base_speed, 10.0)
        
        status = road.get('road_status', 'ACCESSIBLE')
        risk_score = float(road.get('risk_score', 30))

        # Penalties
        status_penalty = {
            'ACCESSIBLE': 0.0,
            'RESTRICTED': 40.0,
            'HIGH_RISK': 120.0,
            'BLOCKED': 9999.0  # Impassable unless no alternative
        }.get(status, 20.0)

        # Risk cost
        risk_penalty = (risk_score ** 1.35) * 0.45 * priority_mult * risk_weight
        
        # Vehicle roughness penalty
        cond = str(road.get('road_condition', 'Good')).capitalize()
        terrain = str(road.get('terrain', 'Plain')).capitalize()
        roughness_penalty = 0.0
        if vehicle_type == 'Heavy Commercial':
            if cond == 'Severe':
                roughness_penalty += 80.0
            elif cond == 'Poor':
                roughness_penalty += 35.0
            if terrain == 'Mountainous':
                roughness_penalty += 30.0

        edge_cost = dist + (travel_time_hours * 25.0) + (status_penalty * risk_weight) + risk_penalty + roughness_penalty

        # Bi-directional road network
        if src not in graph:
            graph[src] = []
        if dst not in graph:
            graph[dst] = []

        graph[src].append({
            'neighbor': dst,
            'cost': edge_cost,
            'road': road,
            'travel_time': travel_time_hours
        })
        graph[dst].append({
            'neighbor': src,
            'cost': edge_cost,
            'road': road,
            'travel_time': travel_time_hours
        })

    return graph

def dijkstra_shortest_path(graph, start_node, end_node):
    """
    Standard Dijkstra search returning minimum cost path.
    """
    queue = [(0.0, start_node, [], [], 0.0, 0.0)] # (cost, current_node, path_nodes, path_edges, total_dist, total_time)
    visited = set()

    while queue:
        cost, curr, path, edges, total_dist, total_time = heapq.heappop(queue)

        if curr in visited:
            continue
        visited.add(curr)

        new_path = path + [curr]

        if curr == end_node:
            return {
                'nodes': new_path,
                'edges': edges,
                'total_cost': round(cost, 1),
                'total_distance_km': round(total_dist, 1),
                'total_time_hours': round(total_time, 1)
            }

        for edge in graph.get(curr, []):
            nxt = edge['neighbor']
            if nxt not in visited:
                edge_road = edge['road']
                dist = float(edge_road['distance_km'])
                t_time = float(edge['travel_time'])
                heapq.heappush(
                    queue,
                    (cost + edge['cost'], nxt, new_path, edges + [edge_road], total_dist + dist, total_time + t_time)
                )

    return None

@routing_bp.route('/optimize', methods=['POST'])
def optimize_route():
    data = request.get_json() or {}
    origin = data.get('origin', '').strip()
    destination = data.get('destination', '').strip()
    vehicle_type = data.get('vehicle_type', 'Heavy Commercial')
    priority = data.get('priority', 'EMERGENCY')

    if not origin or not destination:
        return jsonify({'error': 'Origin and destination locations are required.'}), 400

    if origin == destination:
        return jsonify({'error': 'Origin and destination must be different.'}), 400

    roads = get_live_roads_data()

    # 1. Compute AI Safest Route (Full risk penalty consideration)
    graph_safest = build_graph(roads, vehicle_type, priority, risk_weight=1.5)
    safest_result = dijkstra_shortest_path(graph_safest, origin, destination)

    # 2. Compute Direct Shortest Distance Route (Minimal risk weighting)
    graph_direct = build_graph(roads, vehicle_type, priority, risk_weight=0.05)
    direct_result = dijkstra_shortest_path(graph_direct, origin, destination)

    if not safest_result and not direct_result:
        return jsonify({'error': f'No feasible road route found between {origin} and {destination}.'}), 404

    # Format routes and metrics
    def summarize_route(res, label):
        if not res:
            return None
        edges = res['edges']
        total_risk = sum(float(e.get('risk_score', 30)) for e in edges)
        avg_risk = round(total_risk / max(len(edges), 1), 1)
        blocked_count = sum(1 for e in edges if e.get('road_status') == 'BLOCKED')
        high_risk_count = sum(1 for e in edges if e.get('road_status') in ['HIGH_RISK', 'BLOCKED'])

        risk_level = 'LOW'
        if avg_risk >= 70 or blocked_count > 0:
            risk_level = 'CRITICAL'
        elif avg_risk >= 50 or high_risk_count > 0:
            risk_level = 'HIGH'
        elif avg_risk >= 30:
            risk_level = 'MODERATE'

        # Build coordinate polylines for map rendering
        polylines = []
        for e in edges:
            polylines.append([
                [float(e['lat1']), float(e['lon1'])],
                [float(e['lat2']), float(e['lon2'])]
            ])

        return {
            'label': label,
            'nodes': res['nodes'],
            'edges': edges,
            'distance_km': res['total_distance_km'],
            'travel_time_hours': res['total_time_hours'],
            'avg_risk_score': avg_risk,
            'risk_level': risk_level,
            'route_cost': res['total_cost'],
            'blocked_sections': blocked_count,
            'high_risk_sections': high_risk_count,
            'polylines': polylines
        }

    ai_recommended = summarize_route(safest_result, 'AI Recommended Safest Route')
    direct_route = summarize_route(direct_result, 'Direct Shortest Distance Route')

    # Recommendation verdict
    if ai_recommended['blocked_sections'] == 0 and direct_route and direct_route['blocked_sections'] > 0:
        verdict = f"CRITICAL HAZARD DETECTED on direct route ({direct_route['blocked_sections']} blocked road sector). GLOBAL-SETU strictly advises taking the AI Recommended Safest Route via {', '.join(ai_recommended['nodes'][1:-1]) or 'active bypass'}."
    elif ai_recommended['avg_risk_score'] < (direct_route['avg_risk_score'] - 15):
        verdict = f"The AI Recommended Route reduces catastrophe exposure by {round(direct_route['avg_risk_score'] - ai_recommended['avg_risk_score'])}% despite adding {round(ai_recommended['distance_km'] - direct_route['distance_km'], 1)} km. Recommended for all {priority} convoys."
    else:
        verdict = f"Direct highway is presently within acceptable safety limits. Proceed with standard caution."

    return jsonify({
        'origin': origin,
        'destination': destination,
        'vehicle_type': vehicle_type,
        'priority': priority,
        'ai_recommended': ai_recommended,
        'direct_shortest': direct_route,
        'verdict': verdict
    }), 200
