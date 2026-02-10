#!/bin/bash
# Setup script for Bill.com Statement Distributor

set -e

echo "Setting up Bill.com Statement Distributor..."

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python version: $PYTHON_VERSION"

# Check if Python 3.14+ is available
if ! python3 -c 'import sys; exit(0 if sys.version_info >= (3, 14) else 1)' 2>/dev/null; then
    echo "Error: Python 3.14 or higher is required"
    echo "Please install Python 3.14+ or use pyenv to install it"
    exit 1
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p statements
mkdir -p logs

# Copy example config if config.json doesn't exist
if [ ! -f config.json ]; then
    if [ -f config.example.json ]; then
        echo "Creating config.json from config.example.json..."
        cp config.example.json config.json
        echo "Please edit config.json with your SMTP and database settings"
    else
        echo "Warning: config.example.json not found"
    fi
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit config.json with your SMTP credentials and settings"
echo "2. Run: python3 bill_statement_distributor.py --list-departments"
echo "3. Run: python3 bill_statement_distributor.py --config config.json --from-date 2024-01-01 --to-date 2024-01-31"
echo ""
