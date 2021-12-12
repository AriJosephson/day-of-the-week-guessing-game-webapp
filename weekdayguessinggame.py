# -*- coding: utf-8 -*-
"""
Created on Mon Dec  6 22:39:59 2021

@author: Ari
"""
import datetime
import locale
import random
from flask import Flask, request, render_template

def generate_date(cutoff=80, lang='en_US', date_format='%Y-%m-%d'):
    locale.setlocale(locale.LC_ALL, lang+'.utf8') # need to add the suffix so it'll work on the server
    randunivar = random.uniform(0, 1) # get uniform random variable from 0 to 1
    
    if randunivar < cutoff/100: # cutoff% of the time do dates within a few centuries of the present
        start_date = datetime.date(1582, 10, 15)
        end_date = datetime.date(2400, 12, 31)

    else:
        start_date = datetime.date(1582, 10, 15)
        end_date = datetime.date(9999, 12, 31)
    
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days

    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + datetime.timedelta(days=random_number_of_days)

    return random_date.strftime(date_format), random_date.strftime('%A')

app = Flask(__name__)

@app.route('/')
def my_form():
    return render_template("weekday_guesser.html", cutoff=80)

@app.route('/', methods=['POST'])
def my_form_post():
    cutoff = int(request.form['cutoff'])
    language = request.form['language']
    date_format = request.form['date_format']

    this_date, weekday = generate_date(cutoff=cutoff,
                                       lang=language,
                                       date_format=date_format.replace('_',' '))
    
    return render_template("weekday_guesser.html", 
                           date=this_date, 
                           weekday=weekday)

if __name__ == '__main__':
    app.run()