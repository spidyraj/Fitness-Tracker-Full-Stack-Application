#!/bin/bash
# ─── AI Fitness Tracker — Kubernetes Deployment Script ──────────────────────
# Usage: ./k8s/deploy.sh [namespace]
# Default namespace: fitness-tracker

set -e

NAMESPACE=${1:-fitness-tracker}
REGISTRY_PREFIX="ghcr.io/spidyraj/Fitness-Tracker-Full-Stack-Application"

echo "🚀 Deploying AI Fitness Tracker to Kubernetes namespace: $NAMESPACE"

# 1. Create namespace
echo "📦 Creating namespace..."
kubectl apply -f k8s/namespace.yml

# 2. Apply secrets and config
echo "🔐 Applying secrets and config..."
echo "   ⚠️  Make sure to update k8s/config/secrets-and-configmap.yml with real values first!"
kubectl apply -f k8s/config/secrets-and-configmap.yml

# 3. Deploy services (order matters — gateway last)
echo "🏗️  Deploying microservices..."
kubectl apply -f k8s/services/user-service.yml
kubectl apply -f k8s/services/workout-service.yml
kubectl apply -f k8s/services/nutrition-service.yml
kubectl apply -f k8s/services/analytics-service.yml
kubectl apply -f k8s/services/ai-service.yml
kubectl apply -f k8s/services/gateway.yml

# 4. Deploy Ingress
echo "🌐 Applying Ingress..."
kubectl apply -f k8s/ingress.yml

# 5. Wait for rollout
echo "⏳ Waiting for deployments to be ready..."
kubectl rollout status deployment/user-service -n $NAMESPACE
kubectl rollout status deployment/workout-service -n $NAMESPACE
kubectl rollout status deployment/nutrition-service -n $NAMESPACE
kubectl rollout status deployment/analytics-service -n $NAMESPACE
kubectl rollout status deployment/ai-service -n $NAMESPACE
kubectl rollout status deployment/gateway -n $NAMESPACE

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Pod status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "🔗 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "🌐 Ingress:"
kubectl get ingress -n $NAMESPACE
