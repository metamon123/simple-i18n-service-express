# simple-i18n-service-express

### Response Format

```
{
	success: <boolean>,
	data: <Any>
}
```
* Case 1: success == false
  * data is an error message
* Case 2: success == true
  * data is an expected response format specified in each API
  
### Build & Run

Prerequisite
* docker

```sh
chmod +x build.sh run.sh
./build.sh; run.sh;
```
