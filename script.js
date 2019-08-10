var data = '{"question":[{"1":"01) How good are you at building your product? (Out of ten)","2":"02) How professional are your landscaping drawings?","3":"03) How unique are your garden designs?","4":"04) How satisfactory is your customer experience?","type":"quad-scale"},{"title":"05) Which parts of Economics does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["1. Budgeting","2. Book keeping","3. Payables","4. Receivables","5. Cashflow","6. Payroll","7. Insurance","8. Legal","9. Taxes","Not applicable for my company."]},{"title":"06) Which parts of Human Resources does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["1. Recruitment and Hiring","2. Screening staff","3. Training","4. Punctuality and Absenteeism","5. Retention","6. Compensation and Rewards","7. Corporate Culture","8. Roles & Responsibilities","Not applicable for my company."]},{"title":"07) Which parts of Sales & Marketing does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["1. Branding","2. Website","3. Truck Signs","4. Lawn Signs","5. Social Media","6. Client Screening Process","7. Networks for new connections","Not applicable for my company."]},{"title":"08) Which parts of Operations does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["1. Yard","2. Equipment","3. Supplier Connections","4. Logistics","5. Productivity","6. Efficiency","7. Estimating","8. Scheduling","9. Kaizen – 5S, 7 Types of Waste, 10 Commandments for Continuous Improvement","Not applicable for my company."]},{"title":"09) Which parts of Technology & its Integration does your business struggle with?","description":"Select all that apply.","type":"checkbox","options":["1. Software Accounting","2. Software Operations – Estimating","3. Software Operations - Scheduling","4. Software Design","Not applicable for my company."]},{"title":"10) What would you do diffrently, if your company worked for you?","description":"","type":"text","format":"short answer"},{"title":"If you are interested in improving your company, enter your email below.","description":"We\'ll reach out within 72 hours.","type":"text","format":"email"}]}';
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

function getAdvice(q, a)
{
    if(q == 0)
    {
        if((a == "<5")||(a == "6"))
        {
            return "Your business likely has a lot of warranty to do, fixing and redoing past jobs. This is quite costly, and must be remedied if you wish to stay in business. The cause of this problem is most likely poor information and construction technique. Training staff should be a priority.";
        }
        else if(a == "10")
        {
            return "Your business likely finishes projects on time, has virtually no warranty, and requires little to no job site supervision. You are doing fantastic in this regard.";
        }
        else
        {
            return "Your business likely has some warranty work to complete. Focus on either improving the quality of the information in your job package or developing more skilled staff through training."; 
        }
    }
    else if(q == 1)
    {
        if((a == "<5")||(a == "6"))
        {
            return "Drawings need to be accurate and complete. Your score indicates that yours are likely neither. A business that has achieved a 10/10 will produce drawings that are not only accurate and complete, but presentable as well. Staff are able to work off of the designs without confusion, and the drawings are enticing to clients.";
        }
        else if(a == "10")
        {
            return "Your business produces drawings that are accurate, complete, and presentable. Staff are able to work off of the drawings without confusion, and clients are enticed by the presentation of your designs.";
        }
        else
        {
            return "Drawings need to be accurate and complete. Your score indicates that your drawings most likely are, however, there may be room for improvement in either area. On top of that, high-quality drawings can help entice clients. Working on the presentation can have a positive impact on the client's perception of your company and the quality of work that you do.";   
        }
    }
    else if(q == 2)
    {
        if((a == "<5")||(a == "6"))
        {
            return "Value comes from doing what others are not (or can not). When it comes to garden designs, this means being unique. Based on your score, your designs are cookie-cutter and have poor plant selection (if applicable). Potentially, your clients are the ones supplying a majority of the ideas. If this is the case, your business is not providing value, and will not be successful long-term.";
        }
        else if(a == "10")
        {
            return "Value comes from doing what others are not (or can not). When it comes to garden designs, this means being unique. As a 10/10 business, you have developed a brand through your designs. You stand out in the market and are instantly recognizable.";
        }
        else
        {
            return "Value comes from doing what others are not (or can not). When it comes to garden designs, this means being unique. Based on your score, your designs are fairly distinctive, however, the details may be repeated between projects. This score is okay, and you will be able to differentiate your product in the market, if you have not already. To improve this to a 10, you must stand out in the market and be instantly recognizable, developing a brand through your designs.";  
        }
    }
    else
    {
        if((a == "<5")||(a == "6"))
        {
            return "Good customer experience requires a good process. A well-oiled process will enable you to catch mistakes otherwise made. Clear and frequent communication with the client is also essential. Based on your score, your business is lacking in both of these areas. A 10-out-of-10 company will regularly receive compliments and referrals. They will receive daily progress reports from staff that include photos.";
        }
        else if(a == "10")
        {
            return "You have a great customer experience. You regularly receive compliments as well as referrals. Your staff send daily progress reports that include photos.";
        }
        else
        {
            return "Good customer experience requires a good process. A well-oiled process will enable you to catch mistakes otherwise made. Clear and frequent communication with the client is also essential. Based on your score, your business is lacking in one of these areas."; 
        }
    }
}

function downloadPDF()
{
    var doc = new jsPDF();
    doc.addImage("data:image/png;base64,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aW1lbnNpb24+NjAyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CuQ9qtcAAEAASURBVHgB7N0HlCVHdT/+1u4oB1BAEiBgFguMjcjZJizZmCgwQSIYsPEPG4wNHM4Bm/DHAadjmyTSASyTc7QJwoAIIhgL2xiEbJJQRCiCQCjrX596852t7X3vzZvZ2dldqWv3Tb/XXXXr1q1b33vrVnX3LleX1G3H1K9+l1126Zzzueqqq7rLL7+8+/nPf95deOGF9XPeeed1Puecc0539tlnd2eeeWZ3xhlndBdccEF3ySWXLJZtm4Smz/r167v99tuvO+SQQ7ob3OAG3fWvf/36/YADDugOPPDAztH161znOt0ee+xR869bt64ltfgdvSENEhgkMEhgZ5LALgVYtxvgB9gDngWWuyuvurK7+OKLu/PPP7+C+mmnndb9z//8T/f973+/O/+887sLLrygXvu///u/7oorrqiyBuC3vOUtK3gD6kV6C8ZDJnnRPPnkk7vvfve7i310k5vcpDv44IO76173uvVz0EEHdbe73e26m93sZpUeQ8AA7LbbbpVuxOU4yRgsEh++DBIYJDBIYAeSwJoDfgCzYHvXFVMDnJ3jxZ937nndGWee0Z100kkVlH/84x933/ve97pvfOMb3V577VVBmFe+zz77VE9833337fbee+/qmR966KEVsHfdddex4jVbUIcZgdkBo/Kzn/2szhpq3WXW8J3vfKfWe4tb3KIakOvf4PrdYTc8rDviiCO6+fn5RcOQOhbbslBjDM1YBoaTgwQGCQwS2M4SWDPAb8ExwHjZZZd1F110UffDH/6w+9///d96/Pa3v9195jOf6U4//fQKtIAcAN/85jevoMubB/68bsA/t36uW7d+XfXAhWyWSpdeemn19q+88sruF7/4RfeTn/ykGgLe/6mnnlpnEmYBvp9yyindueee293//vfvbnvb23Y3velNu8MPP7zywvPfc889q5c/rm1L8TFcHyQwSGCQwFpLYE0AP4AYb15c/qc//WkFV978pz71qe4d73jHYtsf/OAHd7/+67/e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", 'PG', 16, 16, 24, 12);
    
    doc.setFontType("bold");
    
    doc.text('BUSINESS HEALTH SURVEY', 16, 38);
    
    var j = 0;
    var q = [];
    var a = [];
    var obj = JSON.parse(data);
    for(let i = 0; i < answer.length; i++)
    {
        a[i] = answer[i];
    }
    
    var pos = 64;
    var advice = "advice here";
    
    doc.setFontSize(12);
    doc.setFontType("bold");
    doc.text("PART A: Self Assessment", 16, pos);
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("1) How good are you at building your product?", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.text("" + a[0][0] + " / 10", 16, pos);
    pos += 6;
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    var splitTitle = doc.splitTextToSize(getAdvice(0, a[0][0]), 100);
    for(var o = 0; o < splitTitle.length; o++)
    {
        doc.text(splitTitle[o], 16, pos);
        pos += 4;
    }
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("2) How professional are your landscaping drawings?", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.text("" + a[0][1] + " / 10", 16, pos);
    pos += 6;
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    var splitTitle2 = doc.splitTextToSize(getAdvice(1, a[0][1]), 100);
    for(var o = 0; o < splitTitle2.length; o++)
    {
        doc.text(splitTitle2[o], 16, pos);
        pos += 4;
    }
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("3) How unique are your garden designs?", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.text("" + a[0][2] + " / 10", 16, pos);
    pos += 6;
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    var splitTitle3 = doc.splitTextToSize(getAdvice(2, a[0][2]), 100);
    for(var o = 0; o < splitTitle3.length; o++)
    {
        doc.text(splitTitle3[o], 16, pos);
        pos += 4;
    }
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("4) How satisfactory is your customer experience?", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.text("" + a[0][3] + " / 10", 16, pos);
    pos += 6;
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    var splitTitle4 = doc.splitTextToSize(getAdvice(3, a[0][3]), 100);
    for(var o = 0; o < splitTitle4.length; o++)
    {
        doc.text(splitTitle4[o], 16, pos);
        pos += 4;
    }
    
    doc.addPage()
    pos = 32;
    doc.setFontSize(12);
    doc.setFontType("bold");
    doc.text("PART B: What To Work On", 16, pos);
    pos += 6;
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    doc.text("A prioritized to-do list.", 16, pos);
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("1) Economics", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var temp1 = Array.from(a[1]);
    if(! temp1.includes("Not applicable for my company."))
    {
        temp1.sort();
        for(var i = 0; i < temp1.length; i++)
        {     
            doc.text("[  ]   " + temp1[i].replace("&amp;","&").substring(3), 16, pos);
            pos += 6;
        }
    }
    pos += 2;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("2) Human Resources", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var temp2 = Array.from(a[2]);
    if(! temp2.includes("Not applicable for my company."))
    {
        temp2.sort();
        for(var i = 0; i < temp2.length; i++)
        {     
            doc.text("[  ]   " + temp2[i].replace("&amp;","&").substring(3), 16, pos);
            pos += 6;
        }
    }
    pos += 2;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("3)  Sales & Marketing", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var temp3 = Array.from(a[3]);
    if(! temp3.includes("Not applicable for my company."))
    {
        temp3.sort();
        for(var i = 0; i < temp3.length; i++)
        {     
            doc.text("[  ]   " + temp3[i].replace("&amp;","&").substring(3), 16, pos);
            pos += 6;
        }
    }
    pos += 2;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("4)  Operations", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var temp4 = Array.from(a[4]);
    if(! temp4.includes("Not applicable for my company."))
    {
        temp4.sort();
        for(var i = 0; i < temp4.length; i++)
        {     
            doc.text("[  ]   " + temp4[i].replace("&amp;","&").substring(3), 16, pos);
            pos += 6;
        }
    }
    pos += 2;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("5)  Technology", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var temp5 = Array.from(a[5]);
    if(! temp5.includes("Not applicable for my company."))
    {
        temp5.sort();
        for(var i = 0; i < temp5.length; i++)
        {     
            doc.text("[  ]   " + temp5[i].replace("&amp;","&").substring(3), 16, pos);
            pos += 6;
        }
    }
    
    
    doc.addPage()
    pos = 32;
    doc.setFontSize(12);
    doc.setFontType("bold");
    doc.text("PART C: Personal", 16, pos);
    pos += 8;
    
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);
    doc.setFontType("normal");
    doc.text("Your driving goal:", 16, pos);
    pos += 6;
    doc.setFontSize(10);
    doc.setFontType("bold");
    var splitTitle5 = doc.splitTextToSize(Array.from(a[6])[0], 150);
    for(var o = 0; o < splitTitle5.length; o++)
    {
        doc.text(splitTitle5[o], 16, pos);
        pos += 6;
    }
    pos += 8;
    
    doc.setFontSize(8);
    doc.setFontType("italic");
    doc.setTextColor(50,50,50);
    var splitTitle6 = doc.splitTextToSize("This is a general business health survey. Knowing your areas of need is the first step, the next step is acting on these problems. To learn how, and take your business to the next step, reach out to Knowledge Tree Consulting.", 150);
    splitTitle6.push("  ");
    splitTitle6.push("knowledgetreeconsulting.ca");
    for(var o = 0; o < splitTitle6.length; o++)
    {
        doc.text(splitTitle6[o], 16, pos);
        pos += 4;
    }
    
    doc.save('KnowledgeTreeConsulting_BusinessHealthSurvey.pdf');
}