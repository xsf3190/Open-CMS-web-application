# OPEN CMS WEB APPLICATION
With most web pages now downloading over 2MB of data (2024 Web Almanac), the internet has become the preserve of the rich. Access to web pages is denied to most in the developing world because developers and website builders have assumed that increasingly powerful devices and expansion of 5g networks will more than compensate their profligacy.

Javascript frameworks have had a devastating effect on the accessibility of web sites built with those technologies. While downloading 2MB on a 5G network in San Francisco will work fine, in Cape Town even on a 4G network most visitors will give up.

Although mostly ignored, the problem is well understood - web pages simply send too much data for the receiving infrastructure to handle efficiently. Images are not the problem - it's javascript either in the form of frameworks or plugins that make users' devices work so hard.

This CMS project aims to provide a simple interface for individuals to create and publish web sites at minimal cost to their visitors. The aim is to create maximum 100KB pages with minimal javascript that users can engage with in less than 2 seconds on 4G mobile networks.

## Self-editing web sites
CMS users edit the content of their web pages in situ on an editor web site - a companion site to their domain web site. They edit and publish their editor site until ready to push the content to their domain. 

In this way, live and editor sites are maintained separately with their content shared and controlled in a central database. 

The enabling tehnologies for this to happen include:

1. a database that securely controls web page content
2. a hosting service to receive published assets
3. an editor for site owners to easily create content
4. use of refresh and access Json Web Tokens to guarantee security

## Personality and Design Choice
Website owners can choose different, complementary Google fonts for headings and text. 

This is made possible through CKEditor's highly flexible plugin system enabling us to replace the standard Font Family feature with a complete interface to Google Fonts.

## Performance Metrics
Published web pages are deployed with a script that automatically collects performance metrics which are pinged back to the database and made available to the website owner in order to monitor performance trends. Metrics include Google Core Web Vitals. For non-supporting browsers (e.g. Safari) we collect what we can - TTFB and FCP. As soon as Safari does support CWVs these will automatically be collected and sent.

For most site owners, the most important metrics are not performance related. Rather, they are interested in how long visitors spend on each page, in what order did they visit other pages on the site, where did they connect from, how were they referred.

Our script is about 4KB in size which contrasts well with Google tag manager that weights in at over 140KB although we don't clam to rival its functionality. It's simply a matter of providing significant information value at the lowest cost possible without unwittingly revealing the visitor's identity. No cookies are used in sites created with the CMS nor are visitors' IP addresses stored thereby avoiding need for annoying cooki consent forms.

## Performance
Averaging less than 2 seconds for first time page visits requires a lot of optimisation. Fonts, for example, are created containing only the characters actually appearing in the content. A plugin replacing CKEditor's font family feature provides access to all of Google's freely available fonts. With different fonts for headings and text a web site can have a great deal of personality.

All font files are self-hosted. This is particlulary important for mobile visitors where DNS lookups are kept to a minimum. It's also important in countries like Germany where GDPR imposes legal restrictions on accessing resources that reveal the visitor's IP address.

## Accessibility
The CMS prevents sites from being published when content fails minimum accessibility requirements - e.g. all images must include an alternative description.

Colour contrast is also ensured by the CMS.

## Security
The CMS enables website owners to edit the site in situ - therefore secured access is essential.

Published websites are covered by a strict Content Security Policy preventing any unapproved Javascript running on the site.

The functionality required to edit a website is heavily reliant on Javascript. Each discrete unit of functionality is performed by a single ESM module hosted on a dedicated CDN. Only when the owner has authenticated will these modules execute.

No passwords or cookies are involved in accessing the CMS, since access involves the issue and renewal of refresh tokens every 5 minutes. In this way owners can effectively stay securely logged in for ever with no need to remember any password. The exposure in the event of physical theft of an owner's device is limited to 5 minutes. Fingerprints are used to further restrict unauthorised access by ensuring users re-authenticate in the event that any attempt is made to access from a previoulsy unknown device/location.


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
