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


@app.route('/gpt4', methods=['GET', 'POST'])
def gpt4():
    data = request.json
    user_input = data.get('user_input')
    messages = data.get('messages', [])
    messages.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        content = response.choices[0].message["content"]
    except RateLimitError:
        content = "The server is experiencing a high volume of requests. Please try again later."

    return jsonify(content=content)


if __name__ == '__main__':
    app.run(debug=True)
