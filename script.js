var expression_idx = -1;
var combinations = [];
var permutation = [];
var wrong_answer_combinations = [];

var correct_answers = 0;
var wrong_answers = 0;

var continue_with_new_question = true;

var passed_seconds = 0;
var passed_minutes = 0;

var answer_timeout;
var timer_interval;

const digit_keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

function update_timer() {
    passed_seconds++;

    if (passed_seconds == 60) {
        passed_minutes++;
        passed_seconds = 0;
    }

    var passed_seconds_string = "";
    if (passed_seconds < 10) {
        passed_seconds_string = "0";
    }
    passed_seconds_string += passed_seconds.toString()

    var passed_minutes_string = "";
    if (passed_minutes < 10) {
        passed_minutes_string = "0";
    }
    passed_minutes_string += passed_minutes.toString()

    document.getElementById('timer').innerText = "Timp: " +
        passed_minutes_string + ":" + passed_seconds_string;
}

function clean_wrong_answer() {
    document.getElementById('body').classList.remove("wrong_answer_bodybackground");
    //document.getElementById('expression_div').setAttribute("style", "background-color: white;");
    document.getElementById('correct_answer_p').remove();
    document.getElementById('continue_button').remove();
    continue_with_new_question = true;
    changeMathExpression();
    timer_interval = setInterval(update_timer, 1000);
}

function evaluateMathExpression() {
    let expression_split = document.getElementById('expression').innerHTML.split("=")
    let combination = combinations[permutation[expression_idx]];
    var correct_answer;
    if (combination[1] == "+") {
        correct_answer = combination[0] + combination[2];
    } else {
        correct_answer = combination[0] - combination[2];
    }

    if (correct_answer == Number(expression_split[1])) {
            correct_answers++;
            document.getElementById('correct_answers').innerHTML = correct_answers;
    }
    else {
        clearTimeout(answer_timeout);
        clearInterval(timer_interval);
        wrong_answers++;
        wrong_answer_combinations.push(combination);

        document.getElementById('wrong_answers').innerHTML = wrong_answers;
        document.getElementById('expression').innerHTML = expression_split[0]
            + "=<strike style='color:red'><span style='color:black'>" + expression_split[1] + "</span></strike>";
        continue_with_new_question = false;

        var correct_answer_p = document.createElement("p");
        correct_answer_p.setAttribute("id", "correct_answer_p");
        correct_answer_p.setAttribute("class", "expression_p");
        correct_answer_p.innerHTML = combination[0].toString() + combination[1] +
            combination[2].toString() + "=" + correct_answer.toString();

        document.getElementById('expression_div').appendChild(correct_answer_p);

        var continue_button = document.createElement("button");
        continue_button.setAttribute("id", "continue_button");
        continue_button.setAttribute("type", "button");
        continue_button.setAttribute("class", "button continue_button");
        continue_button.setAttribute("onclick", "clean_wrong_answer()");
        continue_button.innerText = "Continuă";

        document.getElementById('expression_div').appendChild(continue_button);
        document.getElementById('body').classList.add("wrong_answer_bodybackground");
        //document.getElementById('expression_div').setAttribute("style", "background-color: rgb(250, 179, 153);");
    }
}

function finish() {
    clearTimeout(answer_timeout);
    clearInterval(timer_interval);
    document.getElementById('expression').remove();

    var results_div = document.createElement("div");
    results_div.setAttribute("id", "results_div");

    var results_title_p = document.createElement("p");
    results_title_p.setAttribute("id", "results_title_p");
    results_title_p.innerHTML = "<b>Rezultate</b>";
    results_div.appendChild(results_title_p);

    var correct_answers_p = document.getElementById('correct_answers_p');
    var wrong_answers_p = document.getElementById('wrong_answers_p');
    correct_answers_p.setAttribute("class", "result_p");
    wrong_answers_p.setAttribute("class", "result_p");

    results_div.appendChild(correct_answers_p);
    results_div.appendChild(wrong_answers_p);

    var precision_p = document.createElement("p");
    precision_p.setAttribute("id", "precision_p");
    precision_p.setAttribute("class", "result_p");
    precision_p.innerHTML = "Precizie: <b>" + ((correct_answers/(correct_answers + wrong_answers))
        * 100).toFixed(2).toString() + "%</b>";
    results_div.appendChild(precision_p);

    var timer_p = document.getElementById('timer');
    timer_p.setAttribute("id", "results_timer_p");
    timer_p.setAttribute("class", "result_p");
    timer_p.innerHTML = "Timp: <b>" + timer_p.innerText.substring(6, 11) + "</b>";
    results_div.appendChild(timer_p)

    var mean_time_per_question_p = document.createElement("p");
    mean_time_per_question_p.setAttribute("id", "mean_time_per_question_p");
    mean_time_per_question_p.setAttribute("class", "result_p");
    mean_time_per_question_p.innerHTML = "Timp mediu per întrebare: <b>" + ((60*passed_minutes
        + passed_seconds)/(correct_answers + wrong_answers)).toFixed(2).toString() + "</b> secunde";
    results_div.appendChild(mean_time_per_question_p)

    document.getElementById('principal_div').appendChild(results_div);
}

function changeMathExpression() {
    expression_idx++;
    if (expression_idx == combinations.length) {
        if (wrong_answer_combinations.length == 0) {
            finish();
            return;
        }
        combinations = wrong_answer_combinations;
        wrong_answer_combinations = [];
        permutation = [...Array(combinations.length).keys()];
        shuffle(permutation);
        expression_idx = 0;
    }

    var combination = combinations[permutation[expression_idx]];
    document.getElementById('expression').innerHTML = combination[0].toString() +
        combination[1] + combination[2].toString() + "=?";

    clearTimeout(answer_timeout);
    answer_timeout = setTimeout(evaluateMathExpression, 8000);
}

function keydownEventHandler(event) {
    if (continue_with_new_question) {
        let expression = document.getElementById('expression').innerHTML;

        if (event.key == "Enter" && expression.charAt(expression.length - 1) != "?") {
            evaluateMathExpression();
            if (continue_with_new_question) {
                changeMathExpression();
            }
            return;
        }

        if (event.key == "Backspace" && expression.charAt(expression.length - 1) != "?") {
            expression = expression.slice(0, expression.length - 1);
            if (expression.charAt(expression.length - 1) == "=") {
                expression = expression + "?";
            }
            document.getElementById('expression').innerHTML = expression;
            return;
        }

        if (digit_keys.includes(event.key)) {
            if (expression.charAt(expression.length - 1) == "?") {
                expression = expression.slice(0, expression.length - 1);
            }
            document.getElementById('expression').innerHTML = expression + event.key;
        }
    }
}

function start() {
    document.getElementById('start_button').remove();
    document.getElementById('correct_answers').innerText = "0";
    document.getElementById('wrong_answers').innerText = "0";
    document.addEventListener("keydown", keydownEventHandler)

    expression_idx = -1;
    combinations = [];
    wrong_answer_combinations = [];
    correct_answers = 0;
    wrong_answers = 0;
    continue_with_new_question = true;

    //const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const numbers = [0, 1 ,2];

    for (var i = 0; i <= 10; i++) {
        for (var j = 0; j <= 10; j++) {
            combinations.push([i, "+", j]);
        }
    }

    for (var i = 0; i <= 20; i++) {
        for (var j = 0; j <= 10 && j <= i; j++) {
            if (((i-j)>0) && ((i-j)<=10)) {
                combinations.push([i, "&minus;", j]);
            }
        }
    }

    permutation = [...Array(combinations.length).keys()];
    shuffle(permutation);

    var expression_p = document.createElement("p");
    expression_p.setAttribute("id", "expression");
    expression_p.setAttribute("class", "expression_p");
    document.getElementById('expression_div').appendChild(expression_p);

    changeMathExpression();

    var timer_element = document.createElement("p");
    timer_element.setAttribute("id", "timer");
    timer_element.innerText = "Timp: 00:00";
    document.getElementById('expression_div').appendChild(timer_element);

    passed_seconds = 0;
    passed_minutes = 0;
    timer_interval = setInterval(update_timer, 1000);
}