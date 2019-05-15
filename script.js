var data = '{"question":[{"title":"How good are you at making your product?","description":"1 = poor; 5 = excellent.","type":"scale","amount":5},{"title":"How good is your garden design?","description":"1 = poor; 5 = excellent.","type":"scale","amount":5},{"title":"How unique are your designs?","description":"1 = generic; 5 = distinctive.","type":"scale","amount":5},{"title":"How good your customer experience?","description":"1 = poor; 5 = excellent.","type":"scale","amount":5},{"title":"Which part of Economics does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Budgeting","Book keeping","Payables","Receivables","Cashflow","Payroll","Insurance","Legal","Taxes","We have no problems. Our books are clean, we have lots of cash, and we get everything sent in on time."]},{"title":"Which part of Human Resources does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Recruitment","Screening staff","Hiring","Training","Absenteeism","Punctuality","Retention/Turnover","Rewards","Corporate Culture","Identify Roles & Responsibilities","List of Staff & Years with Company","We\'re all good. We have high retention and a clear system of roles."]},{"title":"Which part of Sales & Marketing does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Branding","Website","Truck Signs","Lawn Signs","Social Media","Screening Process","Networks for new connections","Our sales are execllent. Our website is engaging, we have a large network of connections, and we\'re popular on social media."]},{"title":"Which part of Operations does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Yard","Supplier Connections","Equipment","Logistics","Productivity","Efficiency","Scheduling","Estimating","Kaizen – 5S, 7 Types of Waste, 10 Commandments","We have no problems. Our employees are efficiant and productive."]},{"title":"Which part of Technology & Integration does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Software Accounting","Software Operations – Estimating","Software Operations - Scheduling","Software Design","We\'ve got all of our software down pat."]},{"title":"What would you do diffrently, if your company worked for you?","description":"","type":"text","format":"short answer"},{"title":"How much do you think your company could benefit from consulting?","description":"1 = not at all; 5 = very much.","type":"scale","amount":5},{"title":"If you are interested in our consulting, enter your email below.","description":"We\'ll reach out to you soon.","type":"text","format":"email"}]}';
var current = 0;
var question = [];
var answer = [];
var progressBar = [
    document.getElementById("progress-bar"),
    document.getElementById("progress-bar-percent")
];

importQuestions()

/**
 *  Parses the data to build the questions
 */
function importQuestions()
{
    var obj = JSON.parse(data);
    
    for(let i = 0; i < obj.question.length; i++)
    {
        buildQuestion(obj.question[i], i);
    }
}

function submit()
{
    var responseOut = {};
    var obj = JSON.parse(data);
    
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var unique = "" + Math.floor(Math.random() * 1000)
    
    for(let i = 0; i < answer.length; i++)
    {
        let answerOut = [];
        answer[i].forEach(v => answerOut.push(v));
        
        if(answerOut.length == 1)
        {
            responseOut[obj.question[i].title.replace(/\.|\?|\#|\$|\[|\]|\//, "")] = answerOut[0];
        }
        else
        {
            responseOut[obj.question[i].title.replace(/\.|\?|\#|\$|\[|\]|\//, "")] = answerOut;
        }
        
    }
    
    var firebaseConfig = 
    {
        apiKey: "AIzaSyCBMWKS487otIyO-oy4lJeiopLRJUOnd4Y",
        authDomain: "ktc-survey.firebaseapp.com",
        databaseURL: "https://ktc-survey.firebaseio.com",
        projectId: "ktc-survey",
        storageBucket: "ktc-survey.appspot.com",
        messagingSenderId: "160273374171",
        appId: "1:160273374171:web:e670a53f18547a92"
    };
    
    firebase.initializeApp(firebaseConfig);
    
    var database = firebase.database();
    firebase.database().ref(yyyy + "-" + mm + "-" + dd + "/" + unique).set(
    {
        response: responseOut
    });
    
    
    progressBar[0].style.width = 100 + "%";
    progressBar[1].style.display = "none";
    document.getElementById("back-btn").className = "hidden";
    question[current - 1].className = "prev";
    
    var end = document.createElement("DIV");
    end.className = "popup";
    end.appendChild(document.createElement("P").appendChild(document.createTextNode("Thank you, your response has been submitted.")));
    document.getElementById("content").appendChild(end);
}

/**
 *  Builds the html question element
 */
function buildQuestion(dataIn, index)
{
    var questionElement = document.createElement("DIV");
    questionElement.id = "Q" + index;
    
    if(index == 0)
    {
        questionElement.className = "selected";
    }
    else if(index == 1)
    {
        questionElement.className = "next";
    }
    else
    {
        questionElement.className = "question";
    }
    
    var titleElement = document.createElement("H1");
    var titleTxt = document.createTextNode(dataIn.title);
    titleElement.appendChild(titleTxt);
    questionElement.appendChild(titleElement);
    
    var descElement = document.createElement("P");
    var descTxt = document.createTextNode(dataIn.description);
    descElement.appendChild(descTxt);
    questionElement.appendChild(descElement);
    
    var userInput;
    
    if(dataIn.type == "checkbox")
    {
        userInput = getCheckboxes(dataIn.options, index);
    }
    else if(dataIn.type == "text")
    {
        userInput = getShortAnswer(dataIn.format, index);
    }
    else if(dataIn.type == "scale")
    {
        userInput = getScale(dataIn.amount, index);
    }
    else
    {
        userInput = document.createElement("P");
    }
    
    questionElement.appendChild(userInput);
    
    document.getElementById("content").appendChild(questionElement);
    question.push(questionElement);
    answer.push(new Set());
}

function getCheckboxes(options, index)
{
    var output = document.createElement("UL");
    var option = [];
    
    for(let i = 0; i < options.length; i++)
    {
        option.push(document.createElement("LI"));
        option[i].appendChild(document.createTextNode(options[i]));
        option[i].onclick = function() 
        {
            this.classList.toggle('clicked');
            if(answer[index].has(this.innerHTML))
            {
                answer[index].delete(this.innerHTML);
            }
            else
            {
                answer[index].add(this.innerHTML);
            }
            
            
        };
        output.appendChild(option[i]);
    }
    
    return output;
}

function getShortAnswer(format, index)
{
    var output = document.createElement("H5");
    output.contentEditable = true;
    output.className = format;
    
    var mutationObserver = new MutationObserver(function(mutations) 
    {
        answer[index] = new Set([output.innerHTML]);
    });
    
    mutationObserver.observe(output, 
    {
        attributes: false,
        characterData: true,
        childList: false,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
    });
    
    return output;
}

function getScale(amount, index)
{
    var output = document.createElement("DIV");
    output.className = "scale";
    var option = [];
    
    for(let i = 0; i < amount; i++)
    {
        option.push(document.createElement("P"));
        option[i].appendChild(document.createTextNode((i+1)));
        option[i].onclick = function() 
        {
            this.classList.toggle('clicked');
            answer[index] = new Set([(i + 1)]);
            for(let j = 0; j < amount; j++)
            {
                if(j != i)
                {
                    option[j].className = "";
                }
            }
        };
        output.appendChild(option[i]);
    }
    
    return output;
}

/**
 *  Transitions to the next question
 */
function nextQuestion()
{
    current += 1;
    
    if(current < question.length)
    {
        relabelQuestions();
    }
    else
    {
        submit();
    }
}

/**
 *  Transitions to the previous question
 */
function previousQuestion()
{
    current -= 1;
    
    if(current >= 0)
    {
        relabelQuestions();
    }
    else
    {
        current += 1; //undo last action if out of range
    }
}

/**
 *  Re-labels all questions as .questions (hiding them).
 *  The current and next/prev questions are set accordingly.
 */
function relabelQuestions()
{
    progressBar[0].style.width = ((current / question.length) * 100) + "%";
    progressBar[1].innerHTML = Math.round((current / question.length) * 100) + "%";
    
    if(current == 0)
    {
        document.getElementById("back-btn").className = "hidden";
    }
    else
    {
        document.getElementById("back-btn").className = "";
    }
    
    if(current == (question.length - 1))
    {
        document.getElementById("next-btn").innerHTML = "Submit";
        document.getElementById("next-btn").className = "Submit";
    }
    else
    {
        document.getElementById("next-btn").innerHTML = "Next";
        document.getElementById("next-btn").className = "";
    }
    
    for(let i = 0; i < question.length; i++)
    {        
        if(i == current)
        {
            question[i].className = "selected";
        }
        else if(i == (current - 1))
        {
            question[i].className = "prev";
        }
        else if(i == (current + 1))
        {
            question[i].className = "next";
        }
        else
        {
            question[i].className = "question";
        }
    }
}