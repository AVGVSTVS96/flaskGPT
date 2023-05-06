import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
import openai
from openai.error import RateLimitError

load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/')
def index():
    return render_template('index.html')


def generate(messages):
    assistant_response = []

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=True
        )

        for chunk in response:
            content = chunk['choices'][0]['delta'].get('content', '')
            if content:
                assistant_response.append({"content": content})

    except RateLimitError:
        assistant_response.append(
            {"content": "The server is experiencing a high volume of requests. Please try again later."})

    return assistant_response


@app.route('/gpt4', methods=['POST'])
def gpt4():
    data = request.json
    user_input = data.get('user_input')
    messages = data.get('messages', [])
    messages = [{"role": "system",
                 "content": "respond with only two words and two emojis"}] + messages
    messages.append({"role": "user", "content": user_input})

    assistant_response = generate(messages)
    return jsonify(assistant_response)


if __name__ == '__main__':
    app.run(debug=True)
