# Install PostgreSQL
### Edit php.ini, uncomment “extension=php_pgsql.dll”. Check both the php.ini in the PHP folder and Apache folder
### Edit environment variables, add PostgreSQL /bin and /lib directories to Path. This solves the issue of php_pgsql.dll not loading due to it not being able to resolve dependencies.
Done. PHP should now be able to communicate with PostgreSQL.
