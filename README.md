# oracle-to-github-backup
Automatic backup of an ORACLE schema plus Apex appplications and ORDS metadata to a designated GITHUB repository.

Schema export dump files are encrypted with a randomly generated complex password.

## Pre-requisites
1. Obtain GITHUB Personal access token (classic) - https://github.com/settings/tokens
2. Configure email for OCI tenancy - https://blogs.oracle.com/apex/post/sending-email-from-your-oracle-apex-app-on-autonomous-database

## Use
1. Make Oracle data and definitions available for review / sharing through private or public GITHUB repositories.
2. Provide a secure and reliable off-site backup solution for subscribers to OCI "Always Free". 
3. Implement an automated backup / restore cycle between 2 ADB instances to enable fine-grained point-in-time recovery.
4. Deploy environment to test new Oracle / Apex software versions.
5. Run fully scripted migrations between different platforms (caveat: ORDS metadata).

Should be used for modestly sized schemas (<100MB) although this depends on the nature of data stored.

Note that dump files are compressed by an order of magnitude.

## Install
For backup:
1. GRANT READ,WRITE ON DIRECTORY DATA_PUMP_DIR TO "schema-to-backup"
2. GRANT EXECUTE ON DBMS_CLOUD TO "schema-to-backup"
3. Download contents of TABLE.LOG and PACKAGE.PCK_BACKUP and create in "schema-to-backup"

Adapt the packages to suit any specific requirements.

## Run
```
/*
** Run a one-off export to GITHUB repository, sending status to specified email address
*/
DECLARE
  l_github_token       VARCHAR2(40):='YOUR TOKEN (pre-requisite 1)'; 
  l_github_repos_owner VARCHAR2(40):='YOUR GITHUB ACCOUNT NAME';
  l_github_repos       VARCHAR2(40):='YOUR GITHUB REPOSITORY';
  l_email              VARCHAR2(40):='YOUR EMAIL ADDRESS';  
  l_password           VARCHAR2(20):='COMPLEX PASSWORD';
  l_workspace_name     VARCHAR2(40):='YOUR TARGET ADB WORKSPACE';
  l_restore_files LONG;                
BEGIN 
  pck_backup.github_backup(
        p_github_token => l_github_token,
        p_github_repos_owner => l_github_repos_owner,
        p_github_repos => l_github_repos,
        p_email => l_email,
        p_password => l_password,
        p_restore_files => l_restore_files
  );
END;
```
