from __future__ import annotations

from typing import Any


def require_tensorflow() -> Any:
    try:
        import tensorflow as tf
    except ImportError as exc:
        raise RuntimeError(
            "TensorFlow is required for training/inference. Install AI/requirements-colab.txt "
            "or run the Colab notebook."
        ) from exc
    return tf


def build_conv1d_autoencoder(
    window_size: int,
    feature_count: int,
    encoder_filters: list[int],
    latent_filters: int,
    kernel_size: int,
    learning_rate: float,
):
    tf = require_tensorflow()
    if len(encoder_filters) != 2:
        raise ValueError("encoder_filters must contain exactly two values")

    inputs = tf.keras.Input(shape=(window_size, feature_count), name="imu_window")
    x = tf.keras.layers.Conv1D(
        encoder_filters[0], kernel_size, padding="same", activation="relu", name="encoder_conv_1"
    )(inputs)
    x = tf.keras.layers.MaxPooling1D(2, padding="same", name="encoder_pool_1")(x)
    x = tf.keras.layers.Conv1D(
        encoder_filters[1], kernel_size, padding="same", activation="relu", name="encoder_conv_2"
    )(x)
    x = tf.keras.layers.MaxPooling1D(2, padding="same", name="encoder_pool_2")(x)
    x = tf.keras.layers.Conv1D(
        latent_filters, 3, padding="same", activation="relu", name="latent"
    )(x)
    x = tf.keras.layers.UpSampling1D(2, name="decoder_up_1")(x)
    x = tf.keras.layers.Conv1D(
        encoder_filters[1], kernel_size, padding="same", activation="relu", name="decoder_conv_1"
    )(x)
    x = tf.keras.layers.UpSampling1D(2, name="decoder_up_2")(x)
    x = tf.keras.layers.Conv1D(
        encoder_filters[0], kernel_size, padding="same", activation="relu", name="decoder_conv_2"
    )(x)
    outputs = tf.keras.layers.Conv1D(
        feature_count, 3, padding="same", activation="linear", name="reconstruction"
    )(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="smartbike_conv1d_autoencoder")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="mse",
        metrics=["mae"],
    )
    return model


def load_autoencoder(path: str):
    tf = require_tensorflow()
    return tf.keras.models.load_model(path)

