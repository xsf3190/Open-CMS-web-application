# OPEN CMS WEB APPLICATION
With most web pages downloading over 2MB of data (2024 Web Almanac), the internet has become the preserve of the rich. Access to web pages is denied to most in the developing world because developers and website builders have assumed that increasingly powerful devices and expansion of 5g networks more than compensates their profligacy.

Javascript frameworks have had a devastating effect on the accessibility of web sites built with those technologies. Downloading 2MB on a 5G network in San Francisco might work .. eventually .. but in Cape Town even on a 4G network most visitors will give up. Indeed, many people and businesses in these aeas don't even consider the internet as a vehicle for reliably advertising products and services. 

Although mostly ignored, the problem is well understood - web pages simply send too much data for the receiving infrastructure to handle.

This CMS project aims to provide a simple interface for individuals to create and publish web sites at minimal cost to their visitors. No single page created with this CMS exceeds 50KB in weight on initial download, giving first time visitors every chance that they will be able to interact with the content within 2 seconds. 

## Self-editing web sites
CMS users edit the content of their web pages in situ on an editor web site - a companion site to their domain web site. They edit and publish their editor site until ready to push the content to their domain. 

In this way, live and editor sites are maintained separately with their content shared and controlled in a central database. 

Purchasing a domain is not a pre-requisite. Community web sites, for example, might be happy publishing content on a subdomain of the CMS. 

The enabling tehnologies for this to happen include:

1. a database that controls access to web page content
2. a hosting service to receive published assets
3. an editor for site owners to easily create content
4. use of refresh and access Json Web Tokens to guarantee security

## Performance Metrics
50MB within 2 seconds for first time visitors is an extravagant claim, but supported by the collection of over 10'000 initial web page visits in the last year.

A great advantage of using a central CMS database is that each web page is deployed with a script which automatically and transparently collects performance metrics about the visit. These are pinged back to the database and made available to the website owner and to us so that we can monitor performance trends and identify opportunities for improvement.

These metrics obviously include page weight but we also send Google Core Web Vitals back to the database. For non-supporting browsers (e.g. Safari) we collect what we can - TTFB and FCP. As soon as Safari does support CWVs these will automatically be collected and sent.

For most site owners, the most important metrics are not CWVs - although LCP crucially measures how long visitors wait until being able to interact with the site. Rather, they are interested in how long visitors spent on each page, in what order did they visit other pages on the site, what was their rough location, what browser did they use and most importantly of all, how many visitors were there and how do all of these metrics vary over time. Collecting these details, especially accumulated time spent on each page, is rather expensive - but never to the visitor - the database has to be able to process multiple concurrent transmissions.

Our script is about 5KB in size which contrasts well with Google tag manager that weights in at over 100KB although we don't clam to rival its functionality. It's simply a matter of providing significant information value at the lowest cost possible.

## Performance
Averaging less than 2 seconds for first time page visits requires a lot of optimisation. Fonts, for example, are created with only the characters actually appearing in the content. If a website only uses 10 distinct italic characters for example, then only these are packaged in the delivered font file. We heveloped a plugin to replace CKEditor's font family feature, providing access to over 1800 of Google's freely available fonts. Using different fonts for headings and text can give a web site a great deal of personality. Variable fonts can be used as well as static fonts, affording website owners a lot of design opportunities to subtly change boldness or character spacing for example. One of our sites uses 78 distinct characters across 70 pages - its visitors therefore download only 25KB of font data, compared to the complete Latin font files which weigh in at over 150KB.

All font files are self-hosted. This is particlulary important for mobile visitors for whom we must keep DNS lookups to a minimum. It's also important in some countries (e.g. Germany) where there are GDPR restrictions on accessing resources that reveal the visitor's IP address.

## Accesibility
Use of CKEditor is a great benefit for making our sites accessible. 

We prevent sites from being published that fail minimum accessibility requirements - e.g. including an alternative desription of an image.

Colour contrast is ensured by the CMS - users can choose any colours they like for text, backgrounds, buttons etc as long as they satisfy accessibility requirements.

## Security


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
