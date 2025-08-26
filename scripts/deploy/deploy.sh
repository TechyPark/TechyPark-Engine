#!/bin/bash
set -euo pipefail

echo "🚀 Deploying TechyPark Engine to DigitalOcean..."

# Check for DO token
if [ -z "${DO_TOKEN:-}" ]; then
    echo "❌ DO_TOKEN not set. Please export DO_TOKEN='your_token'"
    exit 1
fi

# Create Kubernetes cluster
echo "Creating Kubernetes cluster..."
doctl kubernetes cluster create techypark-engine-k8s \
    --region nyc3 \
    --node-pool "name=api;size=s-4vcpu-8gb;count=3;auto-scale=true;min-nodes=3;max-nodes=10" \
    --ha \
    --wait

# Save kubeconfig
doctl kubernetes cluster kubeconfig save techypark-engine-k8s

# Create namespaces
kubectl create namespace techypark --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Deploy applications
echo "Deploying applications..."
kubectl apply -k kubernetes/overlays/production/

echo "✅ Deployment complete!"
echo "🌐 Your platform will be available at: https://engine.techypark.com"
