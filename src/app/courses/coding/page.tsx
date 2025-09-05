
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { CodeSnippet } from "@/components/code-snippet";

const courseContent = [
  {
    title: "Module 0: Introduction to Programming",
    pages: [
        {
            title: "Lesson 0.1: What is Programming?",
            content: [
                "Programming is the process of writing exact instructions for a computer to follow.",
                "These instructions are written in special languages that computers understand, like Python or JavaScript.",
                "Using these languages, we can create websites (like Facebook), mobile apps (like Instagram), games, and software tools (like Excel).",
                "It even allows us to control hardware like robots and smart home devices."
            ],
            researchPrompt: "Think about an app you use every day. Try to list five specific instructions you think a programmer had to write to make it work."
        },
        {
            title: "Lesson 0.2: Why Learn Programming?",
            content: [
                "Learning to code is a valuable skill that opens up many career opportunities in fields like Web Development, Data Science, AI, and Game Development.",
                "It's a tool for problem-solving and automation. You can use it to automate repetitive tasks in your work or personal life.",
                "Programming is a creative outlet. It gives you the power to build anything you can imagine.",
                "It enhances logical thinking and your ability to break down complex problems into manageable steps."
            ],
            researchPrompt: "Research one career path that interests you (e.g., 'Web Developer'). What are the typical day-to-day tasks for someone in that role?"
        },
        {
            title: "Lesson 0.3: How Programming Works",
            content: [
                "First, we write human-readable code in a text editor like Visual Studio Code.",
                "Next, a special program called a 'compiler' or 'interpreter' translates our code into machine code (binary 1s and 0s) that the computer's processor (CPU) can execute.",
                "The command line, or terminal, is a powerful tool we use to run these translators and manage our project files.",
                "An IDE (Integrated Development Environment) bundles all these tools—text editor, translator, and terminal—into one application to make development easier."
            ],
            researchPrompt: "What is the key difference between a compiler and an interpreter? Which one does Python use?"
        },
        {
            title: "Lesson 0.4: Overview of Programming Languages",
            content: [
                "There are many different programming languages, each with its own strengths. Think of them as different tools for different jobs.",
                { type: "code", language: "python", code: 'print("Hello, from Python!")' },
                "JavaScript is the language of the web, used to make websites interactive.",
                { type: "code", language: "javascript", code: 'console.log("Hello, from JavaScript!");' },
                "Other languages like C++, Java, and SQL are used for things like high-performance games, large-scale enterprise applications, and managing databases, respectively."
            ],
            researchPrompt: "Besides Python and JavaScript, find two other programming languages and what they are commonly used for."
        },
        {
            title: "Lesson 0.5: The Programmer's Mindset",
            content: [
                "Thinking like a programmer is more important than memorizing code. It's about how you approach problems.",
                "Decomposition: The skill of breaking a large, complex problem down into smaller, simpler, solvable steps.",
                "Pattern Recognition: Identifying similarities between problems to reuse solutions.",
                "Debugging: Understanding that errors are a normal and essential part of the process. Finding and fixing them is a core skill.",
                "Persistence: The best programmers are not those who know everything, but those who are skilled at finding answers and are persistent when facing challenges."
            ],
            researchPrompt: "What is 'pseudocode' and how can it help you plan your program before you write any actual code?"
        }
    ]
  },
  {
    title: "Module 1: Setting Up Your Environment",
    pages: [
        {
            title: "Lesson 1.1: Installing Python",
            content: [
                "We will use Python for this course because its simple syntax makes it beginner-friendly and it's widely used in the industry.",
                "An 'interpreter' is a program that reads and executes your code line by line. First, we need to install the Python interpreter.",
                "For Windows: Download the latest version from python.org and run the installer. Make sure to check the box that says 'Add Python to PATH'.",
                "For macOS: You can use the official installer from python.org or install it via Homebrew with `brew install python`.",
                "To verify your installation, open your terminal (Command Prompt on Windows, Terminal on Mac) and type:",
                { type: "code", language: "bash", code: "python3 --version" },
                "You should see a version number like `Python 3.x.x`."
            ],
            researchPrompt: "What is Homebrew and why is it a popular tool for developers on macOS?"
        },
        {
            title: "Lesson 1.2: Using the Terminal",
            content: [
                "The terminal, or command line, is a powerful text-based interface for interacting with your computer. It's a core tool for every developer.",
                "You can navigate your file system with it. Here are some essential commands:",
                "`cd <folder_name>` - Change directory (move into a folder)",
                "`ls` (or `dir` on Windows) - List files and folders in the current directory",
                "`pwd` - Print working directory (shows where you are)",
                "`mkdir <folder_name>` - Make a new directory",
                "Let's create a project folder. On your Desktop, run:",
                { type: "code", language: "bash", code: "mkdir uvumbuzi-coding-practice" }
            ],
            researchPrompt: "Find three other useful terminal commands and write down what they do."
        },
        {
            title: "Lesson 1.3: Your Code Editor: VS Code",
            content: [
                "A code editor is a text editor designed for writing code. It offers features like syntax highlighting and autocompletion that Notepad or Word don't.",
                "We recommend Visual Studio Code (VS Code). It's free, powerful, and has a huge library of extensions.",
                "First, download and install VS Code from the official website: https://code.visualstudio.com",
                "Next, open VS Code, go to the Extensions tab, and install the official 'Python' extension from Microsoft. This provides features like smart code completion and debugging."
            ],
            researchPrompt: "What is 'linting' in the context of a code editor, and why is it useful?"
        },
        {
            title: "Lesson 1.4: Intro to Git",
            content: [
                "Version control is a system that records changes to a file or set of files over time so that you can recall specific versions later. It's like a 'save' button for your entire project.",
                "Git is the most popular version control system. It allows you to track your code, revert to previous stages, and collaborate with others.",
                "You can install Git from the official website: https://git-scm.com/downloads. After installation, verify it by running `git --version` in your terminal.",
                "To start tracking a project, navigate to your folder in the terminal and run:",
                { type: "code", language: "bash", code: "git init" },
                "This initializes an empty Git repository in your folder."
            ],
            researchPrompt: "What is the difference between `git add .` and `git add <file_name>`?"
        },
        {
            title: "Lesson 1.5: Using GitHub",
            content: [
                "GitHub is a website for hosting Git repositories. It acts as a remote backup for your code and is the primary platform for collaboration in open-source.",
                "First, create a free account at github.com. This will be your coding portfolio.",
                "To upload your code, you first 'commit' your changes locally. A commit is a snapshot of your project at a specific point in time.",
                { type: "code", language: "bash", code: "git add .\ngit commit -m \"Initial commit with my first project setup\"" },
                "Then you 'push' your commits to a repository on GitHub. This makes your code available online.",
                "Having an active GitHub profile is essential for modern developers. It showcases your work to potential employers."
            ],
            researchPrompt: "What is a 'pull request' on GitHub and how is it used in collaborative projects?"
        }
    ]
  },
  {
    title: "Module 2: Programming Basics (Using Python)",
    pages: [
      {
        title: "Lesson 2.1: Your First Python Program",
        content: [
          "Welcome to writing actual code! Let's start with the basics. Python's syntax is designed to be readable and clean. Whitespace (especially indentation) is very important and is used to define code blocks.",
          "The `print()` function is the most basic way to see output from your code. It simply displays whatever you put inside its parentheses on the screen.",
          "Comments are notes for humans that the computer ignores. In Python, you create a comment by starting a line with the `#` symbol. They are crucial for explaining what your code does.",
          { type: "code", language: "python", code: "# This is a comment, the computer will ignore it.\n\nprint(\"Hello, Uvumbuzi Learner!\") # This prints a welcome message."}
        ],
        researchPrompt: "What are 'keywords' in a programming language? Find a list of Python's keywords and try to guess what two of them might do."
      },
      {
        title: "Lesson 2.2: Variables and Data Types",
        content: [
          "A variable is like a labeled box where you can store information. This allows your program to remember and work with data.",
          "Data comes in different 'types'. The most common ones are:",
          "Strings (str): For text, like 'hello' or 'Uvumbuzi'. Always wrapped in quotes.",
          "Integers (int): For whole numbers, like 10, -5, or 100.",
          "Floats (float): For numbers with decimals, like 3.14 or -0.5.",
          "Booleans (bool): Can only be `True` or `False`. Used for logic.",
          "Sometimes you need to convert data from one type to another. This is called 'type casting'.",
          { type: "code", language: "python", code: "name = \"Alex\"         # A string\nage = 25             # An integer\nheight = 5.9         # A float\nis_student = True   # a boolean\n\n# Converting a string input to an integer\nage_string = \"30\"\nage_number = int(age_string)"}
        ],
        researchPrompt: "What happens if you try to add a string to an integer, like `'Hello' + 5`? Why does Python throw an error?"
      },
      {
          title: "Lesson 2.3: Getting User Input",
          content: [
              "Interactive programs need to get input from the user. Python's `input()` function makes this easy.",
              "The `input()` function pauses your program and waits for the user to type something and press Enter.",
              "Important: The `input()` function always returns the user's input as a string, even if they type numbers. You must use type casting (`int()` or `float()`) if you want to use their input for math.",
              { type: "code", language: "python", code: "# Ask for the user's name\nname = input(\"What is your name? \")\n\n# Ask for their age and convert it to an integer\nage = int(input(\"How old are you? \"))\n\nprint(f\"Hello, {name}! You will be {age + 1} on your next birthday.\")"}
          ],
          researchPrompt: "What is an f-string in Python (like `f\"Hello, {name}\"`) and how is it different from regular string concatenation with the `+` sign?"
      },
      {
          title: "Lesson 2.4: Operators and Expressions",
          content: [
              "Operators are the symbols we use to perform operations on data.",
              "Arithmetic Operators: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `**` (exponent), `%` (modulo/remainder).",
              "Comparison Operators: `==` (equal to), `!=` (not equal to), `<` (less than), `>` (greater than), `<=` (less than or equal to), `>=` (greater than or equal to). These always result in a Boolean (`True` or `False`).",
              "Logical Operators: `and` (both must be true), `or` (at least one must be true), `not` (inverts the boolean).",
              { type: "code", language: "python", code: "x = 15\ny = 4\n\n# Arithmetic\nprint(x / y)  # 3.75 (true division)\nprint(x % y)  # 3 (remainder)\n\n# Comparison\nprint(x > 10) # True\n\n# Logical\nprint(x > 10 and y < 5) # True"}
          ],
          researchPrompt: "What is the difference between the `/` operator and the `//` operator in Python? Provide an example."
      },
      {
          title: "Lesson 2.5: Conditional Statements (if/elif/else)",
          content: [
              "Conditional statements allow your program to make decisions and run different code blocks based on whether a condition is true or false.",
              "The structure starts with an `if`, followed by any number of `elif` (else if) blocks, and ends with an optional `else` block that runs if no other conditions were met.",
              "Indentation is critical! The code that belongs to an `if`, `elif`, or `else` block must be indented underneath it.",
              { type: "code", language: "python", code: "score = int(input(\"Enter your score: \"))\n\nif score >= 90:\n    print(\"Grade: A\")\nelif score >= 80:\n    print(\"Grade: B\")\nelif score >= 70:\n    print(\"Grade: C\")\nelse:\n    print(\"You need to improve.\")"}
          ],
          researchPrompt: "What is a 'nested' if statement? Write a simple example where one if statement is inside another."
      },
      {
          title: "Lesson 2.6: Loops (while and for)",
          content: [
              "Loops are used to repeat a block of code multiple times without having to write it over and over.",
              "`while` loop: This loop will continue to run as long as its condition remains `True`. It's great for when you don't know how many times you need to loop.",
              "`for` loop: This loop iterates over a sequence (like a list, a string, or a range of numbers) and runs the code block once for each item in the sequence.",
              "You can control loops with `break` (to exit the loop immediately) and `continue` (to skip the current iteration and go to the next).",
              { type: "code", language: "python", code: "# A for loop using range()\nfor i in range(5):\n    print(f\"Hello number {i + 1}\")\n\n# A while loop for counting down\ncount = 3\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint(\"Blast off!\")"}
          ],
          researchPrompt: "What is an 'infinite loop' and how can you accidentally create one with a `while` loop? Why are they a problem?"
      },
      {
          title: "Lesson 2.7: Mini Project: Number Guessing Game",
          content: [
              "It's time to put everything together! This simple game is a classic first project for new programmers because it uses all the basic concepts we've just learned.",
              "We'll need to use the `random` module, which is a built-in Python library that can generate random numbers.",
              "The logic will involve: generating a secret number, using a `while` loop to keep the game going, getting user input, and using `if/elif/else` to give the user hints.",
              { type: "code", language: "python", code: "import random\n\nsecret_number = random.randint(1, 10)\nguess = 0\n\nwhile guess != secret_number:\n    guess = int(input(\"Guess a number between 1 and 10: \"))\n\n    if guess < secret_number:\n        print(\"Too low, try again!\")\n    elif guess > secret_number:\n        print(\"Too high, try again!\")\n\nprint(\"Congratulations! You guessed it!\")"}
          ],
          researchPrompt: "How could you modify this game to limit the user to only 3 guesses? (Hint: You'll need another variable to track the number of attempts)."
      }
    ]
  },
  {
    title: "Module 3: Data Structures",
    pages: [
        {
            title: "Lesson 3.1: Lists - The Most Useful Data Structure",
            content: [
                "A list is an ordered and changeable collection of items, perfect for storing multiple values that you might need to modify. Think of it like a shopping list.",
                "You create lists using square brackets `[]`.",
                "You can access items by their position (index), starting from 0. `fruits[0]` gives you the first item.",
                "Slicing lets you get a sub-section of the list, like `fruits[1:3]`.",
                "Common list methods include `.append()` to add an item to the end, `.remove()` to delete a specific item, and `.pop()` to remove an item by its index.",
                { type: "code", language: "python", code: "fruits = [\"apple\", \"banana\", \"cherry\"]\nprint(fruits[1])         # Accesses 'banana'\n\nfruits.append(\"orange\")\nprint(fruits)            # Output: ['apple', 'banana', 'cherry', 'orange']\n\nfruits.remove(\"apple\")\nprint(fruits)            # Output: ['banana', 'cherry', 'orange']"}
            ],
            researchPrompt: "What is the difference between the `append()` and `extend()` list methods in Python? Provide an example."
        },
        {
            title: "Lesson 3.2: Tuples - Fixed Data Collections",
            content: [
                "A tuple is like a list, but it's *immutable*, meaning once you create it, you cannot change it. This makes your data safer and your program faster.",
                "They are created using parentheses `()`.",
                "Tuples are often used for data that shouldn't change, like geographical coordinates (latitude, longitude) or RGB color codes.",
                "'Tuple unpacking' is a powerful feature where you can assign the items of a tuple to multiple variables at once.",
                { type: "code", language: "python", code: "# A tuple for coordinates\nlocation = (12.345, 56.789)\n\n# Unpacking the tuple\nlatitude, longitude = location\n\nprint(f\"Latitude: {latitude}\")\nprint(f\"Longitude: {longitude}\")" }
            ],
            researchPrompt: "Why would a tuple be more memory-efficient than a list in Python?"
        },
        {
            title: "Lesson 3.3: Sets - Unique, Unordered Collections",
            content: [
                "A set is an unordered collection of *unique* items. It's great for two main purposes: removing duplicates from a list and performing mathematical set operations.",
                "Sets are created with curly braces `{}` or the `set()` function.",
                "Because they are unordered, you cannot access items using an index.",
                "Key operations include `.add()` to add an item, `.remove()` to take one away, `.union()` (`|`) to combine two sets, and `.intersection()` (`&`) to find common items.",
                { type: "code", language: "python", code: "numbers = [1, 2, 2, 3, 4, 4, 4]\nunique_numbers = set(numbers)\nprint(unique_numbers)  # Output: {1, 2, 3, 4}\n\nset_a = {1, 2, 3}\nset_b = {3, 4, 5}\n\nprint(set_a.intersection(set_b)) # Output: {3}" }
            ],
            researchPrompt: "What is the time complexity for checking if an item exists in a Python set versus a list? Why is one faster?"
        },
        {
            title: "Lesson 3.4: Dictionaries - Key-Value Pairs",
            content: [
                "A dictionary is a collection of key-value pairs. Instead of using a numeric index, you use a unique 'key' to access its corresponding 'value'. Think of it as a real-world dictionary where you look up a word (the key) to find its definition (the value).",
                "Dictionaries are created with curly braces `{}` and colons `:` to separate keys and values.",
                "You can retrieve a value by referencing its key: `person['name']`. Using the `.get()` method is safer as it won't cause an error if the key doesn't exist.",
                "You can loop through a dictionary's keys, values, or both (using `.items()`).",
                { type: "code", language: "python", code: "student = {\n    \"name\": \"Maria Jones\",\n    \"course\": \"Digital Literacy\",\n    \"progress\": 85\n}\n\n# Accessing a value\nprint(f\"{student['name']} has made {student['progress']}% progress.\")\n\n# Adding a new key-value pair\nstudent['location'] = \"Nakuru\"\nprint(student)" }
            ],
            researchPrompt: "What are the rules for dictionary keys in Python? Can a list be used as a key? Why or why not?"
        },
        {
            title: "Lesson 3.5: Nesting & Combining Data Structures",
            content: [
                "The real power of data structures comes from combining them. This allows you to model complex, real-world data.",
                "A list of dictionaries is one of the most common patterns. It's perfect for representing a collection of similar items, where each item has multiple properties (e.g., a list of users).",
                "You can also have a dictionary where the values are lists, which is great for grouping items under a category (e.g., a dictionary of `students` with a list of `grades` for each).",
                "To access nested data, you chain the accessors together.",
                { type: "code", language: "python", code: "# A list of dictionaries\nusers = [\n    {'id': 1, 'name': 'John', 'role': 'Admin'},\n    {'id': 2, 'name': 'Jane', 'role': 'Editor'}\n]\n\n# Accessing nested data\nprint(users[0]['name']) # Output: John\n\n# A dictionary of lists\ncourse_roster = {\n    'math': ['Alice', 'Bob'],\n    'history': ['Charlie', 'David']\n}\n\nprint(course_roster['math'][1]) # Output: Bob"}
            ],
            researchPrompt: "Find an example of a JSON object online (e.g., from a public API). How does its structure relate to Python's lists and dictionaries?"
        },
        {
            title: "Lesson 3.6: Problem Solving with Data Structures",
            content: [
                "Choosing the right data structure is a key programming skill. Your choice affects how easy your code is to write and how efficiently it runs.",
                "Use a **List** when the order of items matters and you need to store duplicates (e.g., a to-do list, a history of user actions).",
                "Use a **Set** when you need to store unique items and quickly check for membership (e.g., storing unique user IDs, lottery numbers).",
                "Use a **Tuple** when you have a small, fixed collection of related items that should not be changed (e.g., coordinates, RGB colors).",
                "Use a **Dictionary** when you need to associate data with a specific identifier or label (e.g., user profiles, inventory items with SKUs)."
            ],
            researchPrompt: "Imagine you are building a simple social media app. Which data structure would you use to store a user's list of friends, and why?"
        },
        {
            title: "Lesson 3.7: Mini Project - Gradebook Manager",
            content: [
                "Let's combine everything from this module to build a practical tool: a student gradebook manager.",
                "This project will use a dictionary to store student names as keys. The value for each student will be a list of their grades.",
                "We'll build functions to add a new student, add a grade to an existing student, and calculate the average grade for a student.",
                { type: "code", language: "python", code: "gradebook = {}\n\ndef add_student(name):\n    gradebook[name] = []\n    print(f\"Student {name} added.\")\n\ndef add_grade(name, grade):\n    if name in gradebook:\n        gradebook[name].append(grade)\n        print(f\"Added grade {grade} for {name}.\")\n    else:\n        print(f\"Student {name} not found.\")\n\ndef get_average(name):\n    if name in gradebook and gradebook[name]:\n        grades = gradebook[name]\n        average = sum(grades) / len(grades)\n        return average\n    return 0\n\n# --- Example Usage ---\nadd_student(\"Alice\")\nadd_grade(\"Alice\", 90)\nadd_grade(\"Alice\", 85)\nprint(f\"Alice's average: {get_average('Alice')}\")" }
            ],
            researchPrompt: "How could you modify this gradebook to also store the subject for each grade? (Hint: Think about changing the structure of the list that holds the grades)."
        }
    ]
  },
  {
    title: "Module 4: Functions and Modules",
    pages: [
        {
            title: "Lesson 4.1: What Are Functions and Why Use Them?",
            content: [
                "Functions are named blocks of reusable code that perform a specific task. They are the building blocks of any well-structured program.",
                "The main reason to use functions is the DRY principle: Don't Repeat Yourself. If you find yourself writing the same piece of code over and over, it's a sign you need a function.",
                "Functions also help organize your code into logical, readable chunks. Instead of one giant script, you have a collection of smaller, manageable pieces.",
                { type: "code", language: "python", code: "# Without a function\nprint(\"Hello!\")\nprint(\"Welcome to the program.\")\n\n# Later in the code...\nprint(\"Hello!\")\nprint(\"Welcome to the program.\")\n\n# With a function\ndef greet():\n    print(\"Hello!\")\n    print(\"Welcome to the program.\")\n\ngreet() # Call the function\ngreet() # Call it again" }
            ],
            researchPrompt: "What is the difference between defining a function and calling a function? Why is this distinction important?"
        },
        {
            title: "Lesson 4.2: Parameters and Arguments",
            content: [
                "Parameters make functions flexible. They are placeholders for the data you want to pass into the function when you call it.",
                "An 'argument' is the actual value you provide for a parameter when you call the function.",
                "You can define default values for parameters, which are used if no argument is provided.",
                "Python allows for both positional arguments (matched by order) and keyword arguments (matched by name), which can make your function calls clearer.",
                { type: "code", language: "python", code: "# 'name' is a parameter with a default value\ndef greet(name=\"User\"):\n    print(f\"Hello, {name}!\")\n\n# 'Alice' is a positional argument\ngreet(\"Alice\")\n\n# This call uses the default value\ngreet()\n\n# 'name=\"Bob\"' is a keyword argument\ngreet(name=\"Bob\")" }
            ],
            researchPrompt: "What is the difference between a positional argument and a keyword argument? When might you prefer to use one over the other?"
        },
        {
            title: "Lesson 4.3: Return Values",
            content: [
                "Functions can process data and send a result back to where they were called. This is done with the `return` keyword.",
                "`print()` simply displays a value on the screen, but `return` gives the value back to the program so it can be stored in a variable or used in another calculation.",
                "A function stops executing as soon as it hits a `return` statement.",
                "If a function doesn't have a `return` statement, it implicitly returns `None`.",
                { type: "code", language: "python", code: "# This function prints, but doesn't return a useful value\ndef print_sum(x, y):\n    print(x + y)\n\n# This function returns the result\ndef calculate_sum(x, y):\n    return x + y\n\nresult = calculate_sum(5, 10)\nprint(f\"The calculated result is: {result}\")" }
            ],
            researchPrompt: "Can a function return multiple values? If so, how does Python handle this?"
        },
        {
            title: "Lesson 4.4: Variable Scope",
            content: [
                "Scope refers to the region of your code where a variable can be accessed.",
                "Variables defined inside a function have a **local scope**. They only exist within that function and are destroyed when the function finishes.",
                "Variables defined outside of any function have a **global scope**. They can be accessed from anywhere in your script, including inside functions.",
                "It's generally bad practice to modify global variables from within a function. It can make your code confusing and hard to debug.",
                { type: "code", language: "python", code: "global_variable = \"I am outside\"\n\ndef my_function():\n    local_variable = \"I am inside\"\n    print(local_variable)      # Works fine\n    print(global_variable)     # Can access global variables\n\nmy_function()\n\n# This would cause an error because local_variable doesn't exist here\n# print(local_variable)" }
            ],
            researchPrompt: "What is the `global` keyword in Python used for, and why should it generally be avoided?"
        },
        {
            title: "Lesson 4.5: Using Built-in Modules",
            content: [
                "Python comes with a 'Standard Library' full of pre-written modules that contain useful functions and data. You don't have to write everything from scratch!",
                "To use a module, you must first `import` it. This makes all the functions from that module available to your script.",
                "The `math` module provides functions for advanced math operations (like square roots).",
                "The `random` module lets you generate random numbers, choose random items, and shuffle lists.",
                { type: "code", language: "python", code: "import math\n\n# Calculate the square root\nprint(math.sqrt(25)) # Output: 5.0\n\nimport random\n\n# Generate a random integer between 1 and 100\nprint(random.randint(1, 100))\n\n# Pick a random fruit from a list\nfruits = ['apple', 'banana', 'cherry']\nprint(random.choice(fruits))" }
            ],
            researchPrompt: "Explore the Python documentation for the `datetime` module. How would you use it to print the current date and time?"
        },
        {
            title: "Lesson 4.6: Creating Your Own Modules",
            content: [
                "As your projects grow, you'll want to split your code into multiple files for better organization. Each Python file (`.py`) is a module.",
                "You can import your own modules just like you import built-in ones. This allows you to create reusable 'helper' functions.",
                "A common pattern is to have a `main.py` file that controls the program's flow and imports functions from other files like `utils.py` or `helpers.py`.",
                "The `if __name__ == '__main__':` block is special. Code inside this block will only run when the file is executed directly, not when it's imported as a module into another file.",
                { type: "code", language: "python", code: "# In a file named 'helpers.py':\ndef add(a, b):\n    return a + b\n\n# In a file named 'main.py':\nimport helpers\n\nresult = helpers.add(10, 20)\nprint(result) # Output: 30" }
            ],
            researchPrompt: "What is the purpose of the `if __name__ == '__main__':` block? Why is it considered a best practice in Python scripts?"
        },
        {
            title: "Lesson 4.7: Mini-Project: Personal Assistant",
            content: [
                "Let's build a simple command-line personal assistant to practice using functions and modules.",
                "The goal is to separate our logic into different files. One file will handle the core logic, and the other will run the program.",
                "This project demonstrates how to build a clean, organized, and scalable program.",
                { type: "code", language: "python", code: "# In 'assistant_functions.py':\nimport datetime\n\ndef get_greeting(name):\n    return f'Hello, {name}!'\n\ndef get_current_time():\n    return datetime.datetime.now().strftime('%H:%M')\n\n# In 'main.py':\nimport assistant_functions as assistant\n\nuser_name = \"Uvumbuzi Learner\"\nprint(assistant.get_greeting(user_name))\nprint(f'The current time is {assistant.get_current_time()}')" }
            ],
            researchPrompt: "How could you add a new function to your assistant that gives a random fact or quote? (Hint: You'll need the `random` module)."
        }
    ]
  },
  {
    title: "Module 5: Error Handling & Debugging",
    pages: [
      {
        title: "Lesson 5.1: Types of Errors in Python",
        content: [
          "Understanding the different kinds of errors is the first step to becoming a great debugger. In Python, errors primarily fall into three categories.",
          "**Syntax Errors:** These are mistakes in the structure of your code. The program won't even start running. Think of them as grammatical errors, like a missing colon or a misspelled keyword.",
          { type: 'code', language: 'python', code: '# A syntax error: missing colon\ndef my_function()\n    print("Hello")' },
          "**Runtime Errors (Exceptions):** These errors occur while the program is running. The syntax is correct, but something unexpected happens, like trying to divide a number by zero or accessing a file that doesn't exist.",
          { type: 'code', language: 'python', code: '# A runtime error: division by zero\nprint(10 / 0)' },
          "**Logic Errors:** This is the trickiest type of error. The code runs without crashing, but it produces the wrong result. The computer is doing exactly what you told it to, but what you told it to do was wrong.",
          { type: 'code', language: 'python', code: '# A logic error: calculates area instead of perimeter\nlength = 5\nwidth = 4\nperimeter = length * width # Should be 2 * (length + width)\nprint(f"Perimeter: {perimeter}")' }
        ],
        researchPrompt: "What is a 'Traceback' in Python? Find an example of an error message and identify the file name, line number, and error type."
      },
      {
        title: "Lesson 5.2: Handling Errors with Try and Except",
        content: [
          "You can't prevent every possible error, but you can stop them from crashing your program. The `try...except` block is Python's way of handling errors gracefully.",
          "You place the code that might cause an error inside the `try` block.",
          "If an error occurs, the code inside the corresponding `except` block is executed. This allows you to give the user a helpful message instead of showing them a scary error traceback.",
          "You can have multiple `except` blocks to handle different types of specific errors.",
          "The `else` block runs only if no errors were found in the `try` block. The `finally` block runs no matter what, whether an error occurred or not. It's often used for cleanup operations.",
          { type: 'code', language: 'python', code: 'try:\n    age = int(input("Enter your age: "))\n    risk_factor = 100 / age\nexcept ValueError:\n    print("That was not a valid number. Please enter only digits.")\nexcept ZeroDivisionError:\n    print("Your age cannot be zero.")\nelse:\n    print(f"Your calculated risk factor is {risk_factor}")\nfinally:\n    print("Thank you for using the risk calculator.")' },
        ],
        researchPrompt: "Is it a good idea to use a bare `except:` block without specifying an error type (like `except Exception:`)? What are the pros and cons of doing this?"
      },
      {
        title: "Lesson 5.3: Debugging Techniques",
        content: [
          "Debugging is the art and science of finding and fixing bugs. The most common and straightforward technique, especially for beginners, is using `print()` statements.",
          "By placing `print()` statements at different points in your code, you can trace the flow of execution and inspect the values of variables at each step. This helps you pinpoint exactly where things went wrong.",
          "Another useful tool is the `id()` function, which returns the unique memory address of an object. This can help you see if two variables are pointing to the exact same object in memory.",
          "Modern IDEs like VS Code have powerful built-in debuggers that allow you to set 'breakpoints'. A breakpoint pauses your program's execution at a specific line, letting you inspect the state of all variables at that moment.",
          { type: 'code', language: 'python', code: 'def calculate_average(grades):\n    total = 0\n    print(f"--- Starting calculation with grades: {grades} ---")\n    for grade in grades:\n        total += grade\n        print(f"Added {grade}, current total is {total}")\n    average = total / len(grades)\n    print(f"--- Final average: {average} ---")\n    return average\n\ncalculate_average([85, 90, 72])' }
        ],
        researchPrompt: "What is 'Rubber Duck Debugging'? Explain the concept and why it can be an effective problem-solving technique."
      },
      {
        title: "Lesson 5.4: Raising Your Own Errors",
        content: [
          "Sometimes, you need to create your own errors. The `raise` keyword allows you to stop your program's execution intentionally if a certain condition isn't met. This is a way of enforcing rules within your program.",
          "For example, if a function requires a positive number as input, you can `raise` a `ValueError` if a negative number is provided. This makes your functions more robust and prevents logic errors down the line.",
          "It's good practice to raise errors when an input or state would lead to an impossible or incorrect outcome.",
          { type: 'code', language: 'python', code: 'def set_age(age):\n    if age < 0:\n        raise ValueError("Age cannot be negative.")\n    if age > 120:\n        raise ValueError("Age seems unlikely, please check the input.")\n    print(f"Age set to {age}")\n\ntry:\n    set_age(-10)\nexcept ValueError as e:\n    print(f"Error: {e}")' }
        ],
        researchPrompt: "How can you create your own custom exception class in Python by inheriting from the base `Exception` class? Provide a simple example."
      },
      {
        title: "Lesson 5.5: Project - Error-Proof Input System",
        content: [
          "Let's build a robust system that won't crash, no matter what the user types. This project will combine everything we've learned about error handling.",
          "The goal is to create a loop that repeatedly asks the user for input until it's valid. We'll validate their name (must be a certain length) and their age (must be a positive number).",
          "This demonstrates a real-world coding skill: writing defensive code that anticipates user mistakes.",
          { type: 'code', language: 'python', code: 'while True:\n    try:\n        name = input("Enter your name: ")\n        if len(name) < 3:\n            raise ValueError("Name must be at least 3 characters.")\n        \n        age = int(input("Enter your age: "))\n        if age <= 0:\n            raise ValueError("Age must be a positive number.")\n        \n        print(f"\\nProfile Created!\\nName: {name}\\nAge: {age}")\n        break # Exit the loop if all input is valid\n\n    except ValueError as e:\n        print(f"Invalid input: {e}. Please try again.\\n")' }
        ],
        researchPrompt: "What is 'input sanitization' and why is it important for security, especially when building web applications?"
      }
    ]
  },
  {
    title: "Module 6: Object-Oriented Programming (OOP)",
    pages: [
      {
        title: "Lesson 6.1: Introduction to OOP",
        content: [
          "Object-Oriented Programming (OOP) is a way of thinking about and organizing code. Instead of a long script, we model our program around real-world 'objects' like a User, a Car, or a Product.",
          "This approach makes code more reusable, easier to manage, and scalable for large projects.",
          "The two core concepts are:",
          "**Class:** A blueprint for creating objects. For example, a `Dog` class would define the properties (like `name`, `age`) and behaviors (like `bark()`) that all dogs have.",
          "**Object (or Instance):** A specific item created from a class. For example, `my_dog = Dog(\"Buddy\", 3)` creates an actual dog object based on the `Dog` blueprint.",
          { type: 'code', language: 'python', code: 'class Dog:\n    # This is the constructor method\n    def __init__(self, name, age):\n        self.name = name  # This is an attribute\n        self.age = age    # This is an attribute\n\n    # This is a method\n    def bark(self):\n        print(f"{self.name} says woof!")\n\n# Creating an object (instance) from the class\ndog1 = Dog("Buddy", 3)\n\n# Calling a method on the object\ndog1.bark() # Output: Buddy says woof!' }
        ],
        researchPrompt: "What is 'procedural programming' and how does it differ from Object-Oriented Programming?"
      },
      {
        title: "Lesson 6.2: Constructors and the __init__ Method",
        content: [
          "The `__init__()` method is a special method in Python classes, often called the 'constructor'. It's automatically called whenever you create a new object from a class.",
          "Its job is to initialize the object's attributes (the data it will hold). This ensures that every object starts with a valid state.",
          "The `self` parameter is a reference to the specific instance of the class being created. It allows you to set attributes on that particular object, like `self.name = name`.",
          { type: 'code', language: 'python', code: 'class Car:\n    # The __init__ method is the constructor\n    def __init__(self, brand, year, color):\n        print("A new car object is being created!")\n        self.brand = brand\n        self.year = year\n        self.color = color\n        self.is_running = False # Default attribute\n\n    def start_engine(self):\n        self.is_running = True\n        print(f"The {self.color} {self.brand}\'s engine is running.")\n\n# When you create this object, __init__ is called automatically\nmy_car = Car("Toyota", 2022, "Red")\n\n# Accessing attributes\nprint(f"My car is a {my_car.year} {my_car.brand}.")' }
        ],
        researchPrompt: "Can a class have more than one `__init__` method in Python? Why or why not?"
      },
      {
        title: "Lesson 6.3: Encapsulation and Private Attributes",
        content: [
          "Encapsulation is the principle of bundling data (attributes) and the methods that operate on that data within a single unit (a class). A key part of this is controlling access to the internal data to prevent accidental modification.",
          "In Python, we use a naming convention to indicate that an attribute should be considered 'private'. A single underscore (`_`) is a hint for other developers, while a double underscore (`__`) 'mangles' the name, making it harder to access from outside the class.",
          "To provide controlled access, we use 'getter' methods to retrieve the value and 'setter' methods to change it. This allows us to add validation or logic before changing the data.",
          { type: 'code', language: 'python', code: 'class BankAccount:\n    def __init__(self, initial_balance):\n        # Double underscore makes this attribute harder to access directly\n        self.__balance = initial_balance\n\n    # A \'getter\' method to safely retrieve the balance\n    def get_balance(self):\n        return self.__balance\n\n    # A \'setter\' method with validation logic\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount\n            print(f"Deposited ${amount}. New balance: ${self.__balance}")\n        else:\n            print("Deposit amount must be positive.")\n\naccount = BankAccount(100)\n\n# Good practice: use the getter method\nprint(f"Current balance: ${account.get_balance()}")\n\n# Bad practice: trying to access directly (will cause an error)\n# print(account.__balance)' }
        ],
        researchPrompt: "What is 'name mangling' in Python and how does it work with double underscore attributes?"
      },
      {
        title: "Lesson 6.4: Inheritance",
        content: [
          "Inheritance is a powerful feature that allows you to create a new class (the 'child' or 'subclass') that inherits attributes and methods from an existing class (the 'parent' or 'superclass').",
          "This promotes code reuse and helps create a logical hierarchy. For example, `Dog` and `Cat` classes could both inherit from an `Animal` class.",
          "The child class can use all of the parent's functionality, and it can also add its own new methods or 'override' parent methods to provide more specific behavior.",
          "The `super()` function is used to call a method from the parent class, which is often useful in the child's `__init__` method.",
          { type: 'code', language: 'python', code: 'class Animal: # Parent class\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        raise NotImplementedError("Subclass must implement this method")\n\nclass Dog(Animal): # Child class\n    def speak(self):\n        return f"{self.name} says Woof!"\n\nclass Cat(Animal): # Child class\n    def speak(self):\n        return f"{self.name} says Meow!"\n\ndog = Dog("Rex")\ncat = Cat("Whiskers")\n\nprint(dog.speak()) # Output: Rex says Woof!\nprint(cat.speak()) # Output: Whiskers says Meow!' }
        ],
        researchPrompt: "What is 'multiple inheritance' in Python, and what is one potential problem it can cause (e.g., the 'Diamond Problem')?"
      },
      {
        title: "Lesson 6.5: Polymorphism",
        content: [
          "Polymorphism, which means 'many forms', is the ability of different objects to respond to the same method call in different ways.",
          "It's closely related to inheritance. When multiple classes inherit from the same parent and override a method, you can treat objects of these different classes in the same way, and Python will automatically call the correct version of the method.",
          "This makes your code more flexible and decoupled. You can write a function that works with any `Animal` without needing to know if it's a `Dog` or a `Cat`.",
          { type: 'code', language: 'python', code: 'class Dog:\n    def speak(self): return "Woof!"\n\nclass Cat:\n    def speak(self): return "Meow!"\n\nclass Duck:\n    def speak(self): return "Quack!"\n\n# This function works with any object that has a .speak() method\ndef make_animal_speak(animal):\n    print(animal.speak())\n\n# Create a list of different animal objects\nanimals = [Dog(), Cat(), Duck()]\n\n# Loop and call the same function on each, getting different results\nfor animal in animals:\n    make_animal_speak(animal)' }
        ],
        researchPrompt: "What is 'Duck Typing' in Python and how does it relate to the concept of polymorphism?"
      },
      {
        title: "Lesson 6.6: Magic Methods",
        content: [
          "Magic methods, also known as 'dunder' (double underscore) methods, are special methods that you can add to your classes to make them behave like Python's built-in types.",
          "They let you define what happens when you use operators like `+`, `len()`, or `print()` on your objects.",
          "`__str__(self)`: Defines what happens when you `print(your_object)`. It should return a user-friendly string.",
          "`__len__(self)`: Defines what `len(your_object)` returns. It should return an integer.",
          "`__repr__(self)`: Defines the 'official' string representation of an object, which should ideally be code that can recreate the object.",
          { type: 'code', language: 'python', code: 'class Playlist:\n    def __init__(self, name, songs):\n        self.name = name\n        self.songs = songs\n\n    # Called by print()\n    def __str__(self):\n        return f"Playlist \'{self.name}\' with {len(self.songs)} songs."\n\n    # Called by len()\n    def __len__(self):\n        return len(self.songs)\n\nmy_playlist = Playlist("Rock Hits", ["Song A", "Song B", "Song C"])\n\nprint(my_playlist)      # Output: Playlist \'Rock Hits\' with 3 songs.\nprint(len(my_playlist)) # Output: 3' }
        ],
        researchPrompt: "Find two other magic methods besides `__str__` and `__len__`. What do they do and when would you use them?"
      },
      {
        title: "Lesson 6.7: OOP Project - Student Management System",
        content: [
          "Time to combine all the OOP concepts into a practical project. We'll build a simple system to manage students and the courses they are enrolled in.",
          "This project will use multiple classes that interact with each other, demonstrating how OOP helps organize more complex programs.",
          "We'll need a `Student` class to hold student data and a `Course` class to manage a roster of students.",
          { type: 'code', language: 'python', code: 'class Student:\n    def __init__(self, name, student_id):\n        self.name = name\n        self.student_id = student_id\n        self.grades = {}\n\n    def __str__(self):\n        return f"Student: {self.name} (ID: {self.student_id})"\n\n    def add_grade(self, course, grade):\n        self.grades[course] = grade\n\nclass Course:\n    def __init__(self, name):\n        self.name = name\n        self.students = []\n\n    def add_student(self, student):\n        self.students.append(student)\n        print(f"{student.name} enrolled in {self.name}.")\n\n# --- Usage ---\nstudent1 = Student("Alice", "123")\nmath_course = Course("Algebra 101")\n\nmath_course.add_student(student1)\nstudent1.add_grade("Algebra 101", 95)\n\nprint(f"{student1.name}\'s grades: {student1.grades}")' }
        ],
        researchPrompt: "How could you add a method to the `Course` class to calculate the average grade for all students enrolled in that specific course?"
      }
    ]
  },
  {
    title: "Module 7: File Handling & Persistence",
    pages: [
      {
        title: "Lesson 7.1: Introduction to File Handling",
        content: [
          "So far, all the data our programs have used disappears when the program ends. To store data permanently, we need to use files. This is called 'persistence'.",
          "The basic operations are opening a file, reading from it or writing to it, and then closing it.",
          "File paths tell the computer where to find a file. A 'relative' path is in relation to your script's location, while an 'absolute' path starts from the root of your hard drive.",
          { type: 'code', language: 'python', code: "# This creates and opens a new file called 'example.txt' in 'write' mode.\nfile = open('example.txt', 'w')\n\n# Write a string of text to the file.\nfile.write(\"Hello, Uvumbuzi World!\")\n\n# It's crucial to close the file to save the changes.\nfile.close()" }
        ],
        researchPrompt: "What is the difference between an absolute path and a relative path in a file system? Provide an example of each."
      },
      {
        title: "Lesson 7.2: File Modes & Safe Handling with 'with'",
        content: [
          "Files can be opened in different 'modes':",
          "**'r'**: Read mode. This is the default. It will give an error if the file doesn't exist.",
          "**'w'**: Write mode. Creates a new file if it doesn't exist, but **overwrites** the file if it does.",
          "**'a'**: Append mode. Adds new content to the end of an existing file without deleting its contents.",
          "**'r+'**: Read and Write mode.",
          "Forgetting to close a file can cause problems. Python's `with` statement (a context manager) handles this automatically, ensuring the file is closed even if errors occur.",
          { type: 'code', language: 'python', code: "# The 'with' statement is the recommended way to handle files.\n# It automatically closes the file for you.\nwith open('log.txt', 'a') as file:\n    file.write(\"New log entry added.\\n\")" }
        ],
        researchPrompt: "What other kinds of resources can be managed with context managers in Python, besides files?"
      },
      {
        title: "Lesson 7.3: Reading from Files",
        content: [
          "There are several ways to read content from a file.",
          "`.read()`: Reads the entire file content into a single string. Be careful with very large files!",
          "`.readline()`: Reads just one line from the file.",
          "`.readlines()`: Reads all lines into a list of strings.",
          "The best practice for reading a text file is to loop directly over the file object. This is memory-efficient because it reads the file line by line.",
          { type: 'code', language: 'python', code: "try:\n    with open('data.txt', 'r') as file:\n        for line in file:\n            # .strip() removes any leading/trailing whitespace, including the newline character\n            print(line.strip())\nexcept FileNotFoundError:\n    print(\"The file 'data.txt' was not found.\")" }
        ],
        researchPrompt: "How would you read only the first 50 characters of a file?"
      },
      {
        title: "Lesson 7.4: Writing and Appending to Files",
        content: [
          "Writing to files is just as straightforward. Remember the difference between `'w'` (write/overwrite) and `'a'` (append).",
          "The `.write()` method writes a single string to the file. If you want to write multiple lines, you must include the newline character `\\n` yourself.",
          "The `.writelines()` method can take a list of strings and write them to the file. It does *not* add newline characters automatically.",
          { type: 'code', language: 'python', code: "notes = [\n    \"This is the first note.\\n\",\n    \"This is the second note.\\n\",\n    \"And a third one!\\n\"\n]\n\nwith open('notes.txt', 'w') as file:\n    file.writelines(notes)" }
        ],
        researchPrompt: "Imagine you are writing a log file for an application. Would you more likely use 'w' or 'a' mode? Why?"
      },
      {
        title: "Lesson 7.5: Working with CSV Files",
        content: [
          "CSV (Comma-Separated Values) is a very common format for storing tabular data, like in a spreadsheet. Python's built-in `csv` module makes working with these files easy.",
          "A `csv.reader` lets you loop over rows in a CSV file, where each row is a list of strings.",
          "A `csv.writer` lets you write rows to a CSV file. The `writerow()` method takes a list and writes it as a comma-separated line.",
          { type: 'code', language: 'python', code: "import csv\n\n# Writing to a CSV file\nwith open('contacts.csv', 'w', newline='') as file:\n    writer = csv.writer(file)\n    writer.writerow(['Name', 'Email', 'Phone'])\n    writer.writerow(['Alice', 'alice@email.com', '111-2222'])\n    writer.writerow(['Bob', 'bob@email.com', '333-4444'])\n\n# Reading from a CSV file\nwith open('contacts.csv', 'r') as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)" }
        ],
        researchPrompt: "What does the `newline=''` argument do when opening a CSV file for writing, and why is it important?"
      },
      {
        title: "Lesson 7.6: Using JSON for Structured Data",
        content: [
          "JSON (JavaScript Object Notation) is the standard format for sending data over the web and is perfect for storing Python dictionaries and lists in a readable way.",
          "The `json` module allows for 'serialization' (converting Python objects to a JSON string) and 'deserialization' (converting a JSON string back into Python objects).",
          "`json.dump()`: Writes a Python object (like a dict or list) to a file in JSON format.",
          "`json.load()`: Reads a JSON file and parses it back into a Python object.",
          { type: 'code', language: 'python', code: "import json\n\nstudent_data = {\n    'name': 'Charlie',\n    'id': 12345,\n    'courses': ['Math', 'History']\n}\n\n# Save the dictionary to a file as JSON\nwith open('student.json', 'w') as file:\n    json.dump(student_data, file, indent=4)\n\n# Load the JSON data back from the file\nwith open('student.json', 'r') as file:\n    loaded_data = json.load(file)\n    print(f\"Welcome back, {loaded_data['name']}\")" }
        ],
        researchPrompt: "What does the `indent` parameter do in `json.dump()`, and why does it make JSON files easier for humans to read?"
      },
      {
        title: "Lesson 7.7: Mini Project - Persistent To-Do List",
        content: [
          "Let's build a command-line to-do list that remembers your tasks even after you close it. This project combines file handling with the data structures you've already learned.",
          "The program will load a list of tasks from a JSON file when it starts, allow the user to add or remove tasks from the list, and then save the updated list back to the JSON file before it exits.",
          "This small project is a huge step towards building real, useful applications.",
          { type: 'code', language: 'python', code: "import json\n\nTASKS_FILE = \"tasks.json\"\n\ndef load_tasks():\n    try:\n        with open(TASKS_FILE, 'r') as f:\n            return json.load(f)\n    except FileNotFoundError:\n        return []\n\ndef save_tasks(tasks):\n    with open(TASKS_FILE, 'w') as f:\n        json.dump(tasks, f, indent=4)\n\n# --- Main Program Logic (Simplified) ---\ntasks = load_tasks()\n# (Here you would add logic to show a menu, add/remove tasks, etc.)\nsave_tasks(tasks)\nprint(\"Tasks saved!\")" }
        ],
        researchPrompt: "How could you extend this to-do list project to mark tasks as 'complete' instead of just removing them?"
      }
    ]
  },
  {
    title: "Module 8: Algorithms & Problem Solving",
    pages: [
      {
        title: "Searching and Sorting Algorithms",
        content: [
          "An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.",
          "Linear Search checks every element in a list one by one. It's simple but can be slow for large lists.",
          "Binary Search is a much faster algorithm for finding an item in a *sorted* list by repeatedly dividing the search interval in half.",
          "Sorting algorithms like Bubble Sort and Insertion Sort are basic methods for arranging items in a specific order.",
        ],
        researchPrompt: "Why must a list be sorted for Binary Search to work?"
      },
      {
        title: "Efficiency and Big-O Notation",
        content: [
          "When solving problems, the efficiency of your code matters. A more efficient algorithm can solve a problem in seconds that might take an inefficient one years.",
          "Big-O notation is a way to describe the performance or complexity of an algorithm as the input size grows.",
          "For example, O(n) (Linear Time) means the runtime grows linearly with the size of the input. O(1) (Constant Time) is extremely fast, as the runtime is independent of input size.",
          "Understanding Big-O helps you choose the right algorithm for the job.",
        ],
        researchPrompt: "What is the Big-O complexity of a Binary Search?"
      }
    ]
  },
];


const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

export default function CodingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isQuizUnlocked, setIsQuizUnlocked] = useState(false);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        router.push('/auth');
        return;
    }
    const hasVisited = localStorage.getItem('hasVisitedCodingCourse');
    if (!hasVisited) {
        setIsFirstTime(true);
        localStorage.setItem('hasVisitedCodingCourse', 'true');
    }

    const savedProgress = localStorage.getItem(`codingCourseProgress_${user.uid}`);
    if (savedProgress) {
        const { module, page } = JSON.parse(savedProgress);
        setCurrentModuleIndex(module);
        setCurrentPageIndex(page);
    }
  }, [user, loading, router]);


  useEffect(() => {
      if(user) {
        const progress = { module: currentModuleIndex, page: currentPageIndex };
        localStorage.setItem(`codingCourseProgress_${user.uid}`, JSON.stringify(progress));
      }
  }, [currentModuleIndex, currentPageIndex, user]);

  const handleNext = () => {
    if (currentPageIndex < courseContent[currentModuleIndex].pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (currentModuleIndex < courseContent.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentPageIndex(0);
    } else {
        const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
        const progressPercentage = (pagesCompleted / totalPages) * 100;
        if (progressPercentage >= 100 && !isQuizUnlocked) {
            setIsQuizUnlocked(true);
        }
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModulePageCount = courseContent[prevModuleIndex].pages.length;
      setCurrentModuleIndex(prevModuleIndex);
      setCurrentPageIndex(prevModulePageCount - 1);
    }
  };

  const handleStartQuiz = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const profileDocRef = doc(db, "userProfiles", user.uid);
    const profileDoc = await getDoc(profileDocRef);

    if (!profileDoc.exists() || !isProfileComplete(profileDoc.data())) {
      toast({
          variant: "destructive",
          title: "Profile Incomplete",
          description: "Please complete your profile before starting the quiz.",
      });
      sessionStorage.setItem('redirectAfterProfileUpdate', '/courses/coding/quiz');
      router.push('/profile');
    } else {
      router.push('/courses/coding/quiz');
    }
  };

  const isProfileComplete = (profile: any) => {
      if (!profile) return false;
      const requiredFields = ['fullName', 'location', 'dateOfBirth', 'gender', 'occupation'];
      return requiredFields.every(field => profile[field]);
  };
  
  const currentModule = courseContent[currentModuleIndex];
  const currentPage = currentModule.pages[currentPageIndex];

  const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
  const progressPercentage = (pagesCompleted / totalPages) * 100;
  const isCourseComplete = progressPercentage >= 100;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <AlertDialog open={isFirstTime} onOpenChange={setIsFirstTime}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">Welcome to the Coding Course!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              Pay close attention to each module. Once you complete the course, you will unlock a quiz.
              This quiz can only be attempted once. Good luck!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsFirstTime(false)}>Let's Begin</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={isQuizUnlocked} onOpenChange={setIsQuizUnlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl flex items-center gap-2">
                <CheckCircle className="text-primary"/> Congratulations!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg pt-2">
              You have completed the course and unlocked the final quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
           <div className="text-sm space-y-2">
                <p>Please read these instructions carefully before you begin:</p>
                <ul className="list-disc list-inside bg-destructive/10 text-destructive-foreground p-4 rounded-md">
                    <li>This quiz can only be attempted <strong>once</strong>.</li>
                    <li>You must score at least <strong>70%</strong> to pass.</li>
                    <li>Leaving the quiz page after starting will result in disqualification.</li>
                </ul>
            </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleStartQuiz} size="lg">I Understand, Start Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-6">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                General Coding Course
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Work through each module to build your knowledge. Research the suggested topics to prepare for the final quiz.
              </p>
            </div>

             <div className="max-w-4xl mx-auto mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Course Progress</span>
                    <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} />
            </div>

            <Card className="max-w-4xl mx-auto min-h-[500px] flex flex-col">
              <CardHeader>
                <CardDescription>{currentModule.title} - Page {currentPageIndex + 1} of {currentModule.pages.length}</CardDescription>
                <CardTitle className="font-headline text-2xl">{currentPage.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                  <div className="space-y-4 text-lg">
                    {currentPage.content.map((item, index) => {
                       if (typeof item === 'string') {
                        return <p key={index}>{item}</p>;
                       }
                       if (item.type === 'code') {
                        return <CodeSnippet key={index} language={item.language} code={item.code} />;
                       }
                       return null;
                    })}
                  </div>
                   <p className="pt-4 text-primary/80 italic">
                        <strong>Research Task:</strong> {currentPage.researchPrompt}
                    </p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={handlePrev} disabled={currentModuleIndex === 0 && currentPageIndex === 0}>
                    <ArrowLeft className="mr-2"/> Previous
                </Button>

                {isCourseComplete ? (
                     <Button onClick={() => setIsQuizUnlocked(true)}>
                        <CheckCircle className="mr-2"/> Finish Course & Unlock Quiz
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next <ArrowRight className="ml-2"/>
                    </Button>
                )}
              </CardFooter>
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

    
