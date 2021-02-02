from flask import Flask, render_template, send_from_directory
app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/model/<path:path>')
def send_model(path):
    return send_from_directory('model', path)

@app.route('/<path:path>')
def send_file(path):
    return send_from_directory('.', path)


if __name__ == "main":
    app.run()
