import re
import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, Response, json
import openai
from openai.error import RateLimitError

load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/')
def index():
    return render_template('index.html')

def process_chunks(concatenated_chunks):
    # Remove unnecessary strings and extract only the JSON objects
    json_objects = re.findall(r'{\s*"content":\s*"[^"]*"\s*}', concatenated_chunks)

    # Parse the JSON objects and create a list of assistant responses
    assistant_responses = []
    for obj_str in json_objects:
        obj = json.loads(obj_str)
        assistant_responses.append({"content": obj["content"]})

    return assistant_responses


def generate(data):
    user_input = data.get('user_input')
    messages = data.get('messages', [])
    messages = [{"role": "system", "content": "respond with only two words and two emojis"}] + messages
    messages.append({"role": "user", "content": user_input})

    assistant_response = []
    current_chunk = ""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=True
        )

        for chunk in response:
            content = chunk['choices'][0]['delta']
            if isinstance(content, str):
                current_chunk += content
            else:
                current_chunk += str(content)

            # Check if the current chunk is a complete JSON object
            try:
                json.loads(current_chunk)
                assistant_response.append({"content": current_chunk})
                current_chunk = ""
            except json.JSONDecodeError:
                pass

    except RateLimitError:
        assistant_response.append(
            {"content": "The server is experiencing a high volume of requests. Please try again later."})

    return jsonify(assistant_response)


@app.route('/gpt4', methods=['POST'])
def gpt4():
    data = request.json
    assistant_response = generate(data)

    # Concatenate the chunks
    concatenated_chunks = ""
    for chunk in assistant_response.json:
        concatenated_chunks += chunk.get("content", "")

    # Now process the concatenated chunks
    processed_response = process_chunks(concatenated_chunks)

    return jsonify(processed_response)



if __name__ == '__main__':
    app.run(debug=True)
