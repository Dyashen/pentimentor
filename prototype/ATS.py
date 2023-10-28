import openai

max_length = 2000
COMPLETIONS_MODEL = "text-davinci-003"
EMBEDDING_MODEL = "text-embedding-ada-002"


class GPT:
    """@sets openai.api_key"""

    def __init__(self, key=None):
        global gpt_api_key
        if key is None:
            gpt_api_key = "not-submitted"
            openai.api_key = key
        else:
            gpt_api_key = key
            openai.api_key = key

    """ @returns prompt, result from gpt """

    def give_synonym(self, word, context):
        prompt = f"""
            Geef een Nederlands synoniem voor '{word}'. Als onbestaand, leg dit woord kort uit (max. 1 zin):
            context:
            {context}
            """
        result = openai.Completion.create(
            prompt=prompt,
            temperature=0,
            max_tokens=10,
            model=COMPLETIONS_MODEL,
            top_p=0.9,
            stream=False,
        )["choices"][0]["text"].strip(" \n")
        return result, word, prompt

    def personalised_simplify(self, sentence, personalisation):
        if "summary" in personalisation:
            prompt = f"""
            Simplify the sentences in the given text and {", ".join(personalisation)}
            :return: A list of simplified sentences divided by a '|' sign
            ///
            {sentence}
            """
        else:
            prompt = f"""
            Explain this in own Dutch words and {", ".join(personalisation)}
            ///
            {sentence}
            """

            result = openai.Completion.create(
                prompt=prompt,
                temperature=0,
                max_tokens=len(prompt),
                model=COMPLETIONS_MODEL,
                top_p=0.9,
                stream=False,
            )["choices"][0]["text"].strip(" \n")

            if "summary" in personalisation:
                result = result.split("|")
            else:
                result = [result]

            return result, prompt

    def personalised_simplify_w_prompt(self, sentences, personalisation):
        result = openai.Completion.create(
            prompt=personalisation,
            temperature=0,
            max_tokens=len(personalisation) + len(sentences),
            model=COMPLETIONS_MODEL,
            top_p=0.9,
            stream=False,
        )["choices"][0]["text"].strip(" \n")
        return result, personalisation
