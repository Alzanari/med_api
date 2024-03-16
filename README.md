# Med API

An API for scraping and tracking medication data in morocco, based on [medicament.ma](https://medicament.ma/).

## Features

- Scrap medications and labs data from [medicament.ma](https://medicament.ma/)
  - Daily check for changed based on last update in the footer
  - Robust multistep process during scraping that support continuation
  - Reasonable automatic data sanitisation
- A comprehenssive API that follows standard best practices

## Roadmap

- Extract therapeutic class and sub-classes based on the ATC code (up to level 3)

- Keep on the changed field in diff objects in step 5 in med scrap

- Implement history for meds collection based on [this](https://stackoverflow.com/a/57719789/19436394)

- Generate reports for meds and labs

- Additional email integration

- Add tests

- Add sources from neighboring countries to compare against

## Run Locally

Clone the project

```bash
  git clone https://github.com/Alzanari/med_api.git
```

Go to the project directory

```bash
  cd med_api
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_LINK`,
`EMAIL_SEED`,
`PASS_SEED`,
`PORT`,
`SALT`,
`SECRET_KEY`,
`REFRESH_SECRET_KEY`.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@Alzanari](https://github.com/Alzanari/)

## Feedback

If you have any feedback, please reach out to me at alzanari@protonmail.com
