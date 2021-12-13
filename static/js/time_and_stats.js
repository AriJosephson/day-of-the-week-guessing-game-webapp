//TO-DO
//very time intensive and maybe unnenecessary, but rewrite date generation function in JS
//add ability to select date range (need to change python and html as well)
//instructions/explanations on how to play (html)
//explain that white space, no diacritics, and uppercase are ignored (html)
//play around with how the footer is displayed (html and css)

// Variables for tracking stats.
var start = null;
var time_taken = null;
var avg_time = null;
var message = "";
var is_correct = 0;
var accuracy = 0;

var num_correct = 0;
var rounds = 0;
var times = []; // const won't seem to work here
var weekdays = [];
var dates = [];
var formats = [];
var langs = [];
var correct = [];
var guesses = [];

// "Dictionaries" to match values with text.
var languages = {};
var date_formats = {};

// Load session variables.
if (sessionStorage.getItem("num_correct")) {
    num_correct = parseInt(sessionStorage.getItem("num_correct"));
}

if (sessionStorage.getItem("rounds")) {
    rounds = parseInt(sessionStorage.getItem("rounds"));
}

if (sessionStorage.getItem("times")) {
    var retrievedData = sessionStorage.getItem("times");
    times = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("weekdays")) {
    var retrievedData = sessionStorage.getItem("weekdays");
    weekdays = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("dates")) {
    var retrievedData = sessionStorage.getItem("dates");
    dates = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("formats")) {
    var retrievedData = sessionStorage.getItem("formats");
    formats = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("langs")) {
    var retrievedData = sessionStorage.getItem("langs");
    langs = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("correct")) {
    var retrievedData = sessionStorage.getItem("correct");
    correct = JSON.parse(retrievedData);
}

if (sessionStorage.getItem("guesses")) {
    var retrievedData = sessionStorage.getItem("guesses");
    guesses = JSON.parse(retrievedData);
}

// Initialize the functions and variables needed to run the game and hide certain parts of the page.
function init() {
    // Timer really doesn't want to be started in this script, so it's done in the body tag in the HTML.
    // Begin tracking time and stop when the user enters a guess.
    start = Date.now();
    enter_guess();

    // Hide the guessing game if there is no date displayed. Dates are at least 10 characters long.
    if (document.getElementById("date").innerHTML.length < 9) {
        document.getElementById("guessing_game").hidden = true;
    }
    
    // Populate the dictionaries based on the options in the form.
    var language_list = document.getElementById('language').options;
    for (var i=0; i<language_list.length; i++) {
        languages[language_list[i].value] = language_list[i].innerHTML;
    }
    
    var date_format_list = document.getElementById('date_format').options;
    for (var i=0; i<date_format_list.length; i++) {
        date_formats[date_format_list[i].value] = date_format_list[i].innerHTML;
    }

    // Keep previously selected options. If they're not set yet, use defaults.
    if (sessionStorage.getItem("language")) {
        document.getElementById("language").value = sessionStorage.getItem("language");
    }
    else {
        document.getElementById("language").value = "en_US";
    }

    if (sessionStorage.getItem("date_format")) {
        document.getElementById("date_format").value = sessionStorage.getItem("date_format");
    }
    else {
        document.getElementById("date_format").value = "%Y-%m-%d";
    }

    if (sessionStorage.getItem("cutoff")) {
        document.getElementById("cutoff").value = sessionStorage.getItem("cutoff");
        document.getElementById("cutoff_text").value = sessionStorage.getItem("cutoff");
    }
    else {
        document.getElementById("cutoff").value = 80;
        document.getElementById("cutoff_text").value = 80;
    }
    
}

// Self-explanatory.
function stop_timing(start_time) {
    time_taken = (Date.now()-start_time)/1000
    times.push(time_taken)
}

// Check to see if the guess is correct.
function check(guess) {
    stop_timing(start)
    rounds++
    var weekday = document.getElementById("weekday").innerHTML;
    weekdays.push(weekday.trim());
    if (guess.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
        weekday.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
        is_correct = 1;
        num_correct++;
        message = `Correct!\nThe answer is indeed ${weekday}.`;
    }
    else {
        message = `Incorrect.\nThe answer is ${weekday}.`;
    }
    correct.push(is_correct);

    // Only allow one guess.
    document.getElementById("guess").disabled = true;
    document.getElementById("check").disabled = true;

    // Move cursor to Generate Date button for faster play. Needs to wait a bit so Enter doesn't auto-click.
    setTimeout(() => { document.getElementById("generate_date").focus(); }, 100);

    display_and_save_results()
}

// Function to let the user enter a guess.
function enter_guess() {
    var guess_element = document.getElementById("guess");

    //One method is to press enter.
    guess_element.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {
            check_enter(e);
        }
    });

    function check_enter(e) {
        var guess = e.target.value;
        check(guess)
    }

    // Another is to click the "Check" button.
    document.getElementById("check").onclick = function() {check(guess_element.value)};
}

// Save options for next date once "Generate Date" button is clicked.
function save_options() {
    var date_format = document.getElementById("date_format").value;
    var language = document.getElementById("language").value;
    var cutoff = document.getElementById("cutoff").value;
    sessionStorage.setItem("language", language);
    sessionStorage.setItem("date_format", date_format);
    sessionStorage.setItem("cutoff", cutoff);
}

// Display guess-specific and cumulative results. Save session results as well.
function display_and_save_results() {
    const sum = times.reduce((a, b) => a + b, 0);
    long_avg_time = (sum / times.length) || 0;
    avg_time = Math.round((long_avg_time + Number.EPSILON) * 1000) / 1000 // Truncate to 3 decimal places.
    accuracy = Math.round((100*num_correct/rounds + Number.EPSILON) * 100) / 100 // "" 2 ""
    document.getElementById("results").innerHTML = `${message}\n\nRounds played: ${rounds}\nAccuracy: ${accuracy}%\nElapsed time: ${time_taken}\nAverage time: ${avg_time}`;
    document.getElementById("results").hidden = false;
    document.getElementById("download_results").hidden = false;
    
    var date = document.getElementById("date").innerHTML;
    dates.push(date);
    var guess = document.getElementById("guess").value;
    guesses.push(guess);
    formats.push(date_formats[sessionStorage.getItem("date_format")]);
    langs.push(languages[sessionStorage.getItem("language")])
    sessionStorage.setItem("num_correct", num_correct);
    sessionStorage.setItem("rounds", rounds);
    sessionStorage.setItem("times", JSON.stringify(times));
    sessionStorage.setItem("weekdays", JSON.stringify(weekdays));
    sessionStorage.setItem("dates", JSON.stringify(dates));
    sessionStorage.setItem("formats", JSON.stringify(formats));
    sessionStorage.setItem("langs", JSON.stringify(langs));
    sessionStorage.setItem("correct", JSON.stringify(correct));
    sessionStorage.setItem("guesses", JSON.stringify(guesses));
}

// Function for finding longest element in an array.
function max_length(arr) {
    var longest = arr.reduce(
        function (a, b) {
            return a.length > b.length ? a : b;
        }
    );

    return longest.length + 1; // Need the +1 so the argument for .repeat() is nonnegative.
}

// Download session stats as a text file.
function download_stats() {
    // Construct the filename.
    var date = new Date();
    const tempname1 = date.toLocaleDateString();
    const fname1 = tempname1.replace(/[ ,.:/]/g, '_');
    const tempname2 = date.toLocaleTimeString();
    const fname2 = tempname2.replace(/[ ,.:/]/g, '_');
    var filename = "weekday_guessing_game_stats_" + fname1 + '_' + fname2 + '.txt'

    // Construct the contents.
    // Rounds, correct, and time are fixed length. Date formats are at the end so don't matter.
    // Variable padding needed for the rest based on length of largest element.
    var maxlendate = max_length(dates);
    var maxlenguess = max_length(guesses);
    var maxlenweekday = max_length(weekdays);
    var maxlenlang = max_length(langs);

    var contents = `Statistics for Weekday Guessing Game session played on ${tempname1} at ${tempname2}\n\n`;
    contents += `Rounds Played: ${rounds}\tNumber of Correct Guesses: ${num_correct}\tAccuracy: ${accuracy}%\tAverage Time: ${avg_time}\n\n\n`;
    contents += "Results by Round (Note: For the CORRECT column, 1=yes and 0=no.)\n"
    contents += `ROUND\tDATE${' '.repeat(maxlendate-4)}\tGUESS${' '.repeat(maxlenguess-5)}\t`
    contents += `ANSWER${' '.repeat(maxlenweekday-6)}\tCORRECT \tTIME\tLANGUAGE${' '.repeat(maxlenlang-8)}\tDATE FORMAT`;
    
    for (var i=0; i<weekdays.length; i++) {
        contents += `\n${i+1}\t${dates[i]}${' '.repeat(maxlendate-dates[i].length)}\t`;
        contents += `${guesses[i]}${' '.repeat(maxlenguess-guesses[i].length)}\t`;
        contents += `${weekdays[i]}${' '.repeat(maxlenweekday-weekdays[i].length)}\t${correct[i]}\t\t`; //Extra tab because header is too long.
        contents += `${times[i]}\t${langs[i]}${' '.repeat(maxlenlang-langs[i].length)}\t${formats[i]}`;
    }

    // Prompt to download the file.
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

// Display or hide the Numberphile video.
function change_display(id) {
    if (document.getElementById(id).style.display === "none") {
        document.getElementById(id).style.display = "block";
    }
    else {
        document.getElementById(id).style.display = "none";
    }
}