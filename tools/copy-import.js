const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')

const googleAuth = require('./modules/googleAuth')

const CREDENTIALS_PATH = path.join(__dirname, './config/credentials.json')
const TOKEN_PATH = path.join(__dirname, './config/token.json')

/* Start change this ---------- */
// Spreadsheet id (found in the spreadsheet url)
const spreadsheetId = 'copy-sheet-id-goes-here'
const outputDir = path.join(__dirname, '../locales/')
/* End change this ---------- */

googleAuth.getClient(CREDENTIALS_PATH, TOKEN_PATH, migrate)

/**
 * Template spreadsheet:
 * https://docs.google.com/spreadsheets/d/10_ROjmC-3kI-yh4XrGYcFnK7tC56F1OeB856CtECC4k
 */
function migrate (auth) {
  const sheets = google.sheets({ version: 'v4', auth })
  sheets.spreadsheets.values.batchGet(
    {
      spreadsheetId,
      majorDimension: 'COLUMNS',
      ranges: ['Main!R5C2:C29'] // Can be multiple sheets
    },
    (err, res) => {
      if (err) {
        return console.error('The API returned an error: ' + err)
      }

      const sheets = res.data.valueRanges // Array of sheet objects
      const langs = [] // Prepare array of files to write
      const avoidCols = ['copyId', 'maxlength', 'comments']

      sheets.map((sheet) => {
        console.log('Parsing:', sheet.range)

        const columns = sheet.values

        if (columns.length === 0) {
          console.error('Error parsing range:', sheet.range)
          return false
        }

        // Parse all content of column
        columns.map((column) => {
          // Avoid all columns but ID and languages
          if (!avoidCols.includes(column[0])) {
            const ids = columns[0]
            const lang = column[0]
            console.log('Lang:', lang)

            const langObject = {}

            for (let i = 1; i < column.length; i++) {
              if (ids[i] !== '') {
                langObject[ids[i]] = column[i]
              }
            }

            const langFile = {}
            langFile[lang] = langObject

            const existingLang = langs.find(l => l[lang])
            if (existingLang === undefined) {
              console.log('-- create lang file wrapper')
              langs.push(langFile)
            } else {
              console.log('-- reuse lang file wrapper')
              Object.assign(existingLang[lang], langObject)
            }
          }
          return true
        })

        return true
      })

      console.log('\nSaving...')

      langs.map((langData) => {
        const lang = Object.keys(langData)[0]
        writeFile(lang, langData[lang])
        return true
      })
    }
  )
}

/**
 * Write File: Function to write a JSON to the file system
 * @param lang String The language code used as file name + .json
 * @param obj Object The data to store into the file
 */
function writeFile (lang, obj) {
  fs.writeFile(outputDir + lang + '.json', JSON.stringify(obj, null, 2), (err) => {
    if (err) {
      throw err
    } else {
      console.log(lang + '.json successfully saved to ' + outputDir)
    }
  })
}
