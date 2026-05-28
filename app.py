from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import os

app = Flask(__name__)

# =========================
# LOAD MODEL
# =========================
model = tf.keras.models.load_model(
    "model/best_model.h5",
    compile=False
)

# =========================
# CLASS NAMES
# =========================
class_names = [
    "Bacterial Blight",
    "Blast",
    "Brown Spot",
    "Tungro"
]

# =========================
# HOME
# =========================
@app.route("/")
def home():
    return render_template("index.html")

# =========================
# PREDICT
# =========================
@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return "No file uploaded"

    file = request.files["file"]

    if file.filename == "":
        return "No selected file"

    # =========================
    # OPEN IMAGE
    # =========================
    image = Image.open(file).convert("RGB")

    # resize
    image = image.resize((224, 224))

    # convert to array
    img_array = np.array(image)

    # preprocess EfficientNet
    img_array = tf.keras.applications.efficientnet.preprocess_input(
        img_array
    )

    # add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    # =========================
    # PREDICT
    # =========================
    prediction = model.predict(img_array)

    predicted_class = class_names[np.argmax(prediction)]

    confidence = round(
        100 * np.max(prediction),
        2
    )

    all_predictions = {}

    for i, class_name in enumerate(class_names):

        all_predictions[class_name] = round(
            float(prediction[0][i] * 100),
            2
        )

    return jsonify({

        "prediction": predicted_class,

        "confidence": confidence,

        "all_predictions": all_predictions

    })

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)