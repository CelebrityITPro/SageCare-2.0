import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

# 1. Load your model (use absolute path)
model_path = r"./dev/models/whisper-medical-v2-final"  # Update this
model = WhisperForConditionalGeneration.from_pretrained(model_path)
processor = WhisperProcessor.from_pretrained(model_path)

# 2. Prepare dummy inputs for BOTH encoder and decoder
dummy_input = {
    "input_features": torch.randn(1, 80, 3000),  # Audio features [batch, freq, time]
    "decoder_input_ids": torch.ones(1, 1, dtype=torch.long) * model.config.decoder_start_token_id
}

# 3. Export with custom forward function
class WhisperWrapper(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
    
    def forward(self, input_features, decoder_input_ids):
        return self.model(
            input_features=input_features,
            decoder_input_ids=decoder_input_ids
        ).logits

wrapped_model = WhisperWrapper(model)

torch.onnx.export(
    wrapped_model,
    (dummy_input["input_features"], dummy_input["decoder_input_ids"]),
    "whisper_medical.onnx",
    input_names=["input_features", "decoder_input_ids"],
    output_names=["logits"],
    dynamic_axes={
        "input_features": {0: "batch", 2: "time"},
        "decoder_input_ids": {0: "batch", 1: "sequence"},
        "logits": {0: "batch", 1: "sequence"}
    },
    opset_version=16,
    do_constant_folding=True
)

print("✅ ONNX export successful!")