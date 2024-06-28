## Developing kme-frontend

### Prerequisites
* `git`
* `yarn`

### Starting the dev frontend-server
* clone **kme** and `cd` into it
* `cd` into *kme-frontend*
* create a file called *.env* and populate the fields from *.env.template* 
* run `yarn` to install all dependencies
* run `yarn start` to run the development server

## Developing kme-backend

### Prerequisites
* `git`
* `postgres` (running in the background or an instance to which you can connect)
* **IntelliJ IDEA** (it's hard to get `kotlin` to work with something else; if you use another editor you're on your own)

### Starting the dev backend-server
* clone **kme**
* open *kme-backend* with **IntelliJ IDEA** (*kme-backend* is located at the base of the repo)
* using `gradle` run the spring project (see gradle tasks or maybe **IntelliJ** already has a run configuration) with the following environment variables:
  * `ACTIVE_PROFILE` set to `dev`. (for the spring profile)
  * `DB_NAME` set to the database name in `postgres`.
  * `DB_USER` set to the user with access to `DB_NAME` in `postgres`.
  * `DB_PASSWORD` set to the password of `DB_USER`.

### Running the tests of kme-backend
* this is similar to the steps above (just change the env vars)
* clone **kme**
* open *kme-backend* with **IntelliJ IDEA** (*kme-backend* is located at the base of the repo)
* using `gradle` run tests (from the *src/test* folder) of the spring project (see gradle tasks or maybe **IntelliJ** already has a run configuration) with the following environment variables:
  * `ACTIVE_PROFILE` set to `test`. (for the spring profile)
  * `DB_NAME` set to the database name in `postgres`.
  * `DB_USER` set to the user with access to `DB_NAME` in `postgres`.
  * `DB_PASSWORD` set to the password of `DB_USER`.
