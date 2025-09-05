
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
    title: "Module 4: Functions & Modules",
    pages: [
      {
        title: "Defining and Using Functions",
        content: [
          "A function is a reusable block of code that performs a specific task. They help keep your code organized and prevent repetition (DRY - Don't Repeat Yourself).",
          "You define a function with the `def` keyword in Python, give it a name, and specify what code it should run.",
          "Parameters are variables listed inside the parentheses in the function definition, which act as placeholders for the data you'll pass in.",
          "The `return` statement is used to send a value back from the function.",
        ],
        researchPrompt: "What is the difference between a parameter and an argument in the context of a function?"
      },
      {
        title: "Scope and Modules",
        content: [
          "Scope determines the visibility of a variable. Variables defined inside a function are in the local scope and can only be used within that function.",
          "Variables defined outside of any function are in the global scope.",
          "A module is simply a file containing Python code. You can import functions from other modules to use in your own code, which is a powerful way to organize large projects.",
          "Python has many built-in modules (like `math` or `random`) that provide useful functions."
        ],
        researchPrompt: "How can you prevent 'namespace pollution' when importing modules in Python?"
      }
    ]
  },
   {
    title: "Module 5: Object-Oriented Programming (OOP)",
    pages: [
      {
        title: "Classes and Objects",
        content: [
          "OOP is a programming paradigm based on the concept of 'objects', which can contain data (attributes) and code (methods).",
          "A Class is a blueprint for creating objects. For example, you could have a `Dog` class.",
          "An Object is an instance of a class. `my_dog = Dog()` would create an object (an instance) of the `Dog` class.",
          "The `__init__` method is a special method that runs automatically when a new object is created, used for initializing its attributes (e.g., `name`, `age`).",
        ],
        researchPrompt: "What does the `self` parameter in a class method refer to?"
      },
      {
        title: "Core OOP Principles",
        content: [
          "Inheritance allows a new class (child) to inherit attributes and methods from an existing class (parent).",
          "Polymorphism means 'many forms', and it allows us to perform a single action in different ways (e.g., different animal classes can have their own `make_sound` method).",
          "Encapsulation is the bundling of data (attributes) and the methods that operate on the data into a single unit (a class). It restricts direct access to some of an object's components.",
          "Abstraction means hiding complex implementation details and showing only the necessary features of the object.",
        ],
        researchPrompt: "Find a real-world analogy for explaining Inheritance in OOP."
      }
    ]
  },
  {
    title: "Module 6: Algorithms & Problem Solving",
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
