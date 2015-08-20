# ODKSummary basic operation

## Tools for summarising data served by ODKAggregate


### Installation

1. navigate to a server root directory - e.g. `cd /var/lib/tomcat7/webapps`

2. `git clone https://github.com/geotheory/ODKSummary`

3. update `config` file with ODGAggregate domain and access credentials

4. update system Java if necessary - min v6 is required


### To run 

(work in progress..)

1. cd into the ODKSummary directory

2. `./get_odk_data.sh *{form_id}*` (the ODKAggregate form ref for the data you want)

3. update file `summarise.js` to open *{form_id.json}* (replace any '.' chars with '_')

4. navigate browser to `http://yourdomain/ODKSummary`

- *[step 2/3 processes to be automated..]*


### Background

- See [NOTES.md](https://github.com/geotheory/ODKSummary/blob/master/NOTES.md) for notes on the individual processes involved

- See also https://opendatakit.org/use/briefcase/
