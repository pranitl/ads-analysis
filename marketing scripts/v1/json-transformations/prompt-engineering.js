const slide = $input.item.json;
const brandStyle = `Brand style — warm documentary photojournalism; natural window light; shallow depth-of-field;
palette leaf-green gradient #0A7A3E→#6FC049 + sunrise-gold #F5AF1B accents; sage-tint backdrop #E8F1E1; neutral charcoal text #333333;
headline in clean geometric sans-serif like Montserrat Bold, body in friendly Open Sans;
subtle leaf motif & soft diagonal sweeps; 4-px radius buttons; generous white space;
overall feeling: trust, vitality, compassionate dawn glow`.trim();


const finalPrompt = `Create an image for a social media carousel slide with the following creative direction:\n\n- **Slide Role:** This is a '${slide.type}' slide, designed to either hook the viewer, agitate a pain point, or present a solution.\n- **Core Emotion:** The feeling this image must evoke is '${slide.concept_key_emotion}'.\n- **Strategic Rationale:** The creative choices should be informed by this goal: '${slide.concept_strategic_rationale}'.\n- **Primary Visual:** The scene to create is: '${slide.visual_idea}'.\n- **Art Direction & Mood:** Follow these notes closely: '${slide.concept_design_notes}'.\n- **Brand Style:** Finally, ensure the output adheres to our brand style: '${brandStyle}'`;

slide.prompt = finalPrompt;

return { json: slide };