var data = '{"question":[{"1":"How good are you at making your product? (Out of ten)","2":"How good is your garden design?","3":"How unique are your designs?","4":"How good your customer experience?","type":"quad-scale"},{"title":"Which part of Economics does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Budgeting","Book keeping","Payables","Receivables","Cashflow","Payroll","Insurance","Legal","Taxes","We have no problems. Our books are clean, we have lots of cash, and we get everything sent in on time."]},{"title":"Which part of Human Resources does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Recruitment","Screening staff","Hiring","Training","Absenteeism","Punctuality","Retention/Turnover","Rewards","Corporate Culture","Identify Roles & Responsibilities","List of Staff & Years with Company","We\'re all good. We have high retention and a clear system of roles."]},{"title":"Which part of Sales & Marketing does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Branding","Website","Truck Signs","Lawn Signs","Social Media","Screening Process","Networks for new connections","Our sales are execllent. Our website is engaging, we have a large network of connections, and we\'re popular on social media."]},{"title":"Which part of Operations does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Yard","Supplier Connections","Equipment","Logistics","Productivity","Efficiency","Scheduling","Estimating","Kaizen – 5S, 7 Types of Waste, 10 Commandments","We have no problems. Our employees are efficiant and productive."]},{"title":"Which part of Technology & Integration does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["Software Accounting","Software Operations – Estimating","Software Operations - Scheduling","Software Design","We\'ve got all of our software down pat."]},{"title":"What would you do diffrently, if your company worked for you?","description":"","type":"text","format":"short answer"},{"title":"How much do you think your company could benefit from consulting?","description":"1 = not at all; 5 = very much.","type":"scale","amount":5},{"title":"If you are interested in our consulting, enter your email below.","description":"We\'ll reach out to you soon.","type":"text","format":"email"}]}';
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
        
        if(obj.question[i].type == "quad-scale")
        {
            responseOut[obj.question[i]["1"]] = answerOut[0];
            responseOut[obj.question[i]["2"]] = answerOut[1];
            responseOut[obj.question[i]["3"]] = answerOut[2];
            responseOut[obj.question[i]["4"]] = answerOut[3];
        }
        else if(answerOut.length == 1)
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
    end.appendChild(document.createElement("P").appendChild(document.createTextNode("Thank you, your response has been submitted. Download your personal report below.")));
    document.getElementById("content").appendChild(end);
    document.getElementById("next-btn").innerHTML = "DOWNLOAD";
    document.getElementById("next-btn").classList.add("downloader");
    document.getElementById("next-btn").onclick = function() 
    {
        downloadPDF();
    }
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
    
    if(dataIn.type == "quad-scale")
    {
        questionElement.appendChild(getQuad(dataIn, index));
        document.getElementById("content").appendChild(questionElement);
        question.push(questionElement);
        answer.push(["-","-","-","-"]);
        return;
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

function getQuad(dataIn, index)
{
    var output = document.createElement("DIV");
    var q = [];
    
    for(let i = 0; i < 4; i++)
    {
        q.push(document.createElement("H3"));
        q[i].appendChild(document.createTextNode((dataIn["" + (i+1)])));
        q[i].appendChild(getQuadScale(index, i));
        output.appendChild(q[i]);
    }
    
    return output;
}

function getQuadScale(index, subindex)
{
    var output = document.createElement("DIV");
    output.className = "scale";
    var option = [];
    
    option.push(document.createElement("P"));
    option[0].appendChild(document.createTextNode("<5"));
    option[0].onclick = function() 
    {
        this.classList.toggle('clicked');
        answer[index][subindex] = "<5";
        for(let j = 1; j < 6; j++)
        {
            option[j].className = "";
        }
    };
    output.appendChild(option[0]);
    
    for(let i = 0; i < 5; i++)
    {
        option.push(document.createElement("P"));
        option[i+1].appendChild(document.createTextNode((i+6)));
        option[i+1].onclick = function() 
        {
            this.classList.toggle('clicked');
            answer[index][subindex] = i + 6;
            for(let j = 0; j < 6; j++)
            {
                if(j != (i+1))
                {
                    option[j].className = "";
                }
            }
        };
        output.appendChild(option[i+1]);
    }
        
    return output;
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
    
    try
    {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    catch(error)
    {
        window.scrollTo(0, 0);
    }
}

function downloadPDF()
{
    var doc = new jsPDF();
    doc.addImage("data:image/png;base64,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", 'PNG', 16, 16, 24, 13)
    
    doc.setFontType("bold");
    
    doc.text('BUSINESS HEALTH SURVEY', 16, 58);
    doc.text('TEST', 16, 64);
    
    
    doc.save('KnowledgeTreeConsulting_BusinessHealthSurvey.pdf');
}