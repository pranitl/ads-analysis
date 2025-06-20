This n8n workflow automates the creation and refinement of social media carousel posts by simulating a creative agency's process using a series of AI agents and data transformation steps.

Here is a breakdown of the logic and flow:

### Workflow Goal

The primary goal is to take a blog post and a target audience as input and produce a refined, production-ready social media carousel concept that has been tested against a simulated customer persona.

---

### Flow Steps & Logic

The workflow can be broken down into four main stages:

#### 1. Ideation: Generating Initial Drafts

This stage takes the raw source material and generates initial creative ideas.

* **Node: `Topic Extractor` (AI Agent)**
    * **Purpose:** To brainstorm high-level content ideas from a blog post.
    * **Logic:** It analyzes the provided `Blog Post` and `Target Audience` to extract 3-5 key topics that would be suitable for short-form video content (like TikToks). This step helps identify the most engaging core themes.
    * **Output:** A list of topic strings in a JSON format.

* **Node: `Code` (Data Transformation)**
    * **Purpose:** To format the topics for the next step.
    * **Logic:** It takes the list of topics from the `Topic Extractor` and converts it into a structured array of objects.

* **Node: `Jr. Script Writer1` (AI Agent)**
    * **Purpose:** To act as a "junior creative" and draft initial carousel concepts.
    * **Logic:** This agent is prompted to generate three distinct, emotionally-driven carousel ideas based on the original blog post and target audience. It follows a "Problem, Agitate, Solve" structure, focusing on a conversational, human tone and providing initial ideas for slide-by-slide text and visuals.
    * **Output:** An array of three detailed carousel concepts in a structured JSON format.

#### 2. Feedback: Simulating a Focus Group

This stage takes the initial drafts and subjects them to critique from a target audience persona.

* **Node: `Code3` (Data Transformation)**
    * **Purpose:** To clean and prepare the draft concepts for the focus group.
    * **Logic:** It takes the output from the Junior Script Writer, cleans up any extraneous formatting (like markdown code fences), and ensures the data is a clean JSON array ready for the next step.

* **Node: `Adult Children ICP Analyzer1` (AI Agent)**
    * **Purpose:** To act as a simulated customer focus group.
    * **Logic:** This agent adopts the persona of a very specific ideal customer profile: an adult child of a senior in the Boston Northwest region. It receives the carousel concepts and provides detailed, critical feedback from that persona's point of view, answering specific questions about what resonates, what feels generic, and what questions remain unanswered.
    * **Output:** Detailed, qualitative text feedback on the carousel concepts.

#### 3. Refinement: Creating the Final Version

This stage synthesizes the initial draft with the focus group feedback to create a polished, final asset.

* **Node: `Sr. Script Writer1` (AI Agent)**
    * **Purpose:** To act as a "senior content strategist" who refines the creative work.
    * **Logic:** This agent is given both the original carousel concept from the `Jr. Script Writer` and the feedback from the `Adult Children ICP Analyzer`. Its task is to integrate the feedback, sharpen the narrative, elevate the copy to a more empathetic and authoritative tone, and provide concrete, actionable design notes for a graphic designer.
    * **Output:** A single, polished, production-ready carousel concept in a structured JSON format, including a `strategic_rationale` explaining *why* the changes were made.

#### 4. Finalization: Structuring Data for Delivery

This final stage transforms the polished creative into a format that can be easily used by other systems.

* **Node: `Restructure JSON` (Data Transformation)**
    * **Purpose:** To ensure the final JSON from the Senior Script Writer is clean.
    * **Logic:** This node robustly cleans and parses the output from the previous step, handling any potential formatting errors to ensure clean data downstream.

* **Node: `JSON Cleanup` (Data Transformation)**
    * **Purpose:** To flatten and restructure the final data for its ultimate destination (e.g., a database, CMS, or content scheduling tool).
    * **Logic:** This node takes the single JSON object representing the final carousel and breaks it down into individual items for *each slide*. It extracts and organizes all information—from high-level strategy and design notes to the specific text and visual idea for each slide—into a flat, easy-to-use format.