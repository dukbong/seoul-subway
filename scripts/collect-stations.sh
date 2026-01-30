#!/bin/bash
#
# Seoul Subway Station Data Collector
#
# This script fetches all station data from Seoul Open API and saves it to data/stations.json
# Run this once to populate the static station data.
#
# Usage:
#   ./scripts/collect-stations.sh
#
# Requirements:
#   - SEOUL_OPENAPI_KEY environment variable must be set
#   - curl and jq must be installed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PROJECT_ROOT/data/stations.json"

# Check for required tools
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    exit 1
fi

# Check for API key
if [ -z "$SEOUL_OPENAPI_KEY" ]; then
    echo "Error: SEOUL_OPENAPI_KEY environment variable is not set."
    echo ""
    echo "To get an API key:"
    echo "1. Go to https://data.seoul.go.kr/together/mypage/actkeyMain.do"
    echo "2. Sign up and request an API key"
    echo "3. Export it: export SEOUL_OPENAPI_KEY='your-key-here'"
    exit 1
fi

echo "Fetching station data from Seoul Open API..."

# The API returns up to 1000 results per request
# Seoul subway has about 300-400 stations, so one request should be enough
API_URL="http://openapi.seoul.go.kr:8088/${SEOUL_OPENAPI_KEY}/json/SearchInfoBySubwayNameService/1/1000/"

RESPONSE=$(curl -s "$API_URL")

# Check for API errors
if echo "$RESPONSE" | jq -e '.RESULT.CODE' &> /dev/null; then
    ERROR_CODE=$(echo "$RESPONSE" | jq -r '.RESULT.CODE')
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.RESULT.MESSAGE')
    echo "API Error: $ERROR_CODE - $ERROR_MSG"
    exit 1
fi

# Check if we got valid data
if ! echo "$RESPONSE" | jq -e '.SearchInfoBySubwayNameService.row' &> /dev/null; then
    echo "Error: Unexpected API response format"
    echo "$RESPONSE" | head -c 500
    exit 1
fi

# Extract station data and format it
TOTAL_COUNT=$(echo "$RESPONSE" | jq '.SearchInfoBySubwayNameService.list_total_count')
echo "Found $TOTAL_COUNT stations"

# Transform the data into our format
STATIONS=$(echo "$RESPONSE" | jq '[.SearchInfoBySubwayNameService.row[] | {
    code: .STATION_CD,
    name: .STATION_NM,
    line: .LINE_NUM,
    frCode: .FR_CODE
}]')

# Create the output JSON
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OUTPUT=$(jq -n \
    --arg generated "$TIMESTAMP" \
    --argjson stations "$STATIONS" \
    '{
        "_comment": "Station data from Seoul Open API (SearchInfoBySubwayNameService)",
        "_generated": $generated,
        "_source": "http://openapi.seoul.go.kr:8088/{KEY}/json/SearchInfoBySubwayNameService",
        "totalCount": ($stations | length),
        "stations": $stations
    }')

# Save to file
echo "$OUTPUT" > "$OUTPUT_FILE"

echo "Successfully saved $(echo "$STATIONS" | jq 'length') stations to $OUTPUT_FILE"
echo "Generated at: $TIMESTAMP"
