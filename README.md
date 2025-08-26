# OPEN CMS WEB APPLICATION
With most web pages downloading over 2MB of data (2024 Web Almanac), the internet has become the preserve of the rich. Access to web pages is denied to most in the developing world because developers and website builders have assumed that increasingly powerful devices and expansion of 5g networks more than compensates for their profligacy.

Javascript frameworks have had a devastating effect on the accessibility of web sites buit with those technologies. Downloading 2MB on a 5G network in San Francisco might work .. eventually .. but in Cape Town even on a 4G network most visitors will give up. Indeed, many people and businesses in these aeas don't even consider the internet as a viable vehicle for advertising products and services. 

Although mostly ignored, the problem is well understood - web pages simply send too much data for the receiving infrastructure to handle.

This CMS project aims to provide a simple interface whereby individuals can create and publish web sites at minimal cost to their visitors. No single page created with this CMS exceeds 50KB in weight, giving first time visitors every chance that they will be able to interact with the content within 2 seconds. 

## Self-editing web sites
CMS users edit the content of their web pages in situ on their editor web site - a companion site for their domain web site. They edit and publish their editor site until ready to push the content to their domain. 

In this way, the live and editor sites are maintained separately with their content shared and controlled in a central database. 

Some users may not want to purchase a domain. Community web sites, for example, might be perfectly happy to publish content on a subdomain of the CMS. 

The enabling tehnologies for this to happen include:

1. a database that controls access to web page content
2. a hosting service to receive published assets
3. an editor for site owners to easily create content
4. use of refresh and access Json Web Tokens to guarantee security


## Performance amd Security



# Oracle to Github backup
This repository contains data and object definitions backed up daily from an ORACLE "Always Free" OCI database.

The backup is a compressed, encrypted schema export dump file.

Includes DDL metadata extracts of tables, packages and grants.

Includes static Javascript and CSS files.

Includes Oracle ORDS REST schema defining API routes for the CMS application.

## Pre-requisites
1. Obtain GITHUB Personal access token (classic) - https://github.com/settings/tokens
2. Create credential in "schema-to-backup" referencing the Github account name and token, e.g.

```
begin
  dbms_cloud.create_credential (
    credential_name => 'GITHUB_CRED',
    username        => 'xsf3190',
    password        => '***********'
  ) ;
end;
```
   
## Ideas for Use
1. Provide a secure and reliable off-site backup solution. 
2. Make current and historical code available for easy reference / sharing.
3. Provide an automatic backup / restore cycle betweeen 2 databases.
4. Deploy an environment to test a new Oracle software release.

Note that although Github supports a maximum file size of 100MB, the Advanced Compression option reduces dump file size by an order of magnitude (up to 10 times).

## Install
Logged on to the subject database as ADMIN
1. GRANT READ,WRITE ON DIRECTORY DATA_PUMP_DIR TO "schema-to-backup"
2. GRANT EXECUTE ON DBMS_CLOUD TO "schema-to-backup"
3. GRANT EXECUTE ON DBMS_CLOUD_REPO TO "schema-to-backup"
4. Compile PACKAGE.PCK_BACKUP from this repository in "schema-to-backup"

## Run
For example, to schedule every day at 9PM
```
BEGIN
  DBMS_SCHEDULER.create_job (
    job_name=> 'DAILY_BACKUP',
    job_type=> 'PLSQL_BLOCK',
    job_action=> 'begin pck_backup.daily_backup; end;',
    start_date=> systimestamp,
    repeat_interval=> 'FREQ=DAILY; Interval=1;BYHOUR=21;ByMinute=0',
    enabled =>TRUE,
    auto_drop=>FALSE);
end;
/
```
