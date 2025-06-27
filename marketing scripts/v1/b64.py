import json

# Step 1: Read the JSON file
with open('/Users/plahoty/Downloads/HTTP_Request.json', 'r') as file:
    data = json.load(file)

# Step 2: Update the value of the "b64_json" key
for item in data:
    if 'json' in item and 'data' in item['json']:
        for data_item in item['json']['data']:
            if 'b64_json' in data_item:
                data_item['b64_json'] = 'XXX'

# Step 3: Write the modified data back to the JSON file
with open('marketing scripts/outputs/image1.json', 'w') as file:
    json.dump(data, file, indent=4)