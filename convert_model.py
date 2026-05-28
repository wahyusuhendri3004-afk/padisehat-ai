import keras

# load model lama
model = keras.models.load_model(
    "model/model_optimized.keras"
)

# save ulang jadi .h5
model.save("model/fixed_model.h5")

print("✅ Model berhasil dikonversi!")