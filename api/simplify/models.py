from django.db import models
import json, os
import openai

from openai import OpenAI
client = OpenAI(api_key = "your api key")

class Replacer(models.Model):

    def __init__(self):
        script_dir = os.path.dirname(__file__)  # Absolute dir the script is in
        rel_path = "sample.json"
        abs_file_path = os.path.join(script_dir, rel_path)
        with open(abs_file_path, "r") as json_file:
            self.sentences = json.load(json_file)
    def clean_json_string(self, json_str):
        # Remove backslashes and newline characters
        cleaned_str = json_str.replace("\\", "").replace("\n", " ")
        return cleaned_str
    def generate_simplifications(self, text):
        try:
            instruction = f"""
            For the given sentence: "{text}", perform the following tasks:

            1. Identify **all** complex or less common words and provide their simpler synonyms.
            2. Provide a **lexical simplification** of the sentence by replacing complex words with simpler synonyms, ensuring to simplify as many words as possible without altering the meaning.
            3. Provide a **sentence paraphrase** that conveys the same meaning in simpler, more straightforward terms.
            4. Provide a **syntactic simplification** by breaking down complex sentence structures into simpler ones.
            5. Provide a **syntactic and lexical simplification** by applying both sentence structure simplification and word replacement.
            Format the response as follows:
            
            "{text}": {{ 
                "lexical": "Simplified sentence with lexical changes.",
                "words": {{
                    "complex_word1": "simple_word1", 
                    "complex_word2": "simple_word2",
                    ...
                }}, 
                "syntactic": "Simplified sentence with syntactic changes.",
                "syntactic_and_lexical": "Sentence with both syntactic and lexical changes."
            }}
            """
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Simplify complex sentences by identifying complex words and simplifying sentence structure."},
                    {"role": "user", "content": instruction}
                ]
            )
            simplified_text = response.choices[0].message.content
            # print("Simplified Text ", simplified_text)
            # .choices[0].message.content
            return self.clean_json_string(simplified_text)
        except Exception as e:
            print(f"Error while calling OpenAI API: {e}")
            return None

    def replaceSentence(self, to_replace):
        print("Sentence to be replaced ----->", to_replace)
        try:
            if to_replace in self.sentences:
                return self.sentences[to_replace]

            sentence = self.generate_simplifications(to_replace)
            if sentence:
                try:
                    # Extract only the JSON part of the response
                    # Split at the first colon, and take the part after it
                    json_part = sentence.split(":", 1)[1].strip()
                    res = json.loads(json_part)
                    self.sentences[to_replace] = res
                    self.save_to_json()
                    return res
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON: {e}")
                    return {}
        except Exception as ex:
            print(f"Error in replaceSentence: {ex}")
            return {}
    # def clean_json_string(json_str):
    #     # Remove backslashes and newline characters
    #     cleaned_str = json_str.replace("\\", "").replace("\n", "")
    
    #     return cleaned_str


    def save_to_json(self):
        script_dir = os.path.dirname(__file__)  # Absolute dir the script is in
        rel_path = "sample.json"
        abs_file_path = os.path.join(script_dir, rel_path)
        # print("Save to JSON PRINT", self.sentences)
        # self.sentence = self.clean_json_string(self.sentence)
        try:
            with open(abs_file_path, "w") as json_file:
                json.dump(self.sentences, json_file, indent=4)
            print("Successfully saved simplifications to sample.json")
        except Exception as e:
            print(f"Failed to save to sample.json: {e}")
