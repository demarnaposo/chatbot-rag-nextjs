import PromptSuggestionsButton from "./PromptSuggestionsButton"

const PromptSuggestionRow = ({ onPromptClick }) => {
    const prompts = [
        "Siapa kepala balap untuk tim F1 Academy milik Aston Martin Aramco Formula One Team?",
        "Siapa pembalap F1 dengan bayaran tertinggi?",
        "Siapa yang akan menjadi pembalap terbaru untuk Ferrari?",
        "Siapa juara dunia pembalap Formula One saat ini?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => <PromptSuggestionsButton key={`suggestion-${index}`}
            text={prompt}
            onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}

export default PromptSuggestionRow