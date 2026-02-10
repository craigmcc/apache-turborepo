#!/bin/bash
# Setup script for ramp-statement-distributor
# This script sets up the Python environment using pyenv and virtualenv

set -e  # Exit on error

echo "=== Ramp Statement Distributor Setup ==="
echo ""

# Check if pyenv is installed
if ! command -v pyenv &> /dev/null; then
    echo "Error: pyenv is not installed."
    echo "Please install pyenv first:"
    echo "  macOS: brew install pyenv"
    echo "  Linux: curl https://pyenv.run | bash"
    exit 1
fi

echo "✓ pyenv is installed"

# Get the required Python version from .python-version
PYTHON_VERSION=$(cat .python-version)
echo "Required Python version: $PYTHON_VERSION"

# Check if the required Python version is installed
if ! pyenv versions --bare | grep -q "^${PYTHON_VERSION}$"; then
    echo "Installing Python $PYTHON_VERSION..."
    pyenv install $PYTHON_VERSION
else
    echo "✓ Python $PYTHON_VERSION is already installed"
fi

# Set local Python version
pyenv local $PYTHON_VERSION

# Reload pyenv to ensure the new Python version is available
eval "$(pyenv init -)"
export PYENV_VERSION=$PYTHON_VERSION

# Verify Python version
CURRENT_VERSION=$(pyenv exec python --version | cut -d' ' -f2)
echo "Active Python version: $CURRENT_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    pyenv exec python -m venv .venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "✓ Setup complete!"
echo ""
echo "To use the tool:"
echo "  1. Activate the virtual environment:"
echo "     source .venv/bin/activate"
echo ""
echo "  2. When done, deactivate with:"
echo "     deactivate"
echo ""
echo "Next steps:"
echo "  1. Copy config.example.json to config.json"
echo "  2. Edit config.json with your settings"
echo "  3. Activate the virtual environment"
echo "  4. Run the tool: python ramp_statement_distributor.py --config config.json"

