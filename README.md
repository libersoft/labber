# Labber

  Labber is an open source Laboratory Information Management System (LIMS).
  
  It is written with a symfony (PHP, version 1.4) backend, an Ext JS (JavaScript, version 3.4) frontend and is database agnostic.
  
  It is licensed under the GNU Affero General Public License (version 3).


## Installation

    git clone https://github.com/libersoft/labber.git && cd labber
    git submodule init && git submodule update

  Please refer to the [Getting started](http://symfony.com/legacy/doc/getting-started) legacy symfony documentation.

    mkdir web/uploads
    cp config/ProjectConfiguration.class.php.orig config/ProjectConfiguration.class.php
    cp config/databases.yml.orig config/databases.yml
    vim config/databases.yml
    
    php symfony doctrine:build --db --model
    php symfony guard:create-admin username password

    php symfony plugin:publish-assets
    php symfony extdirect:generate-api labber
    php symfony cc
  
  Optionally:

    php symfony doctrine:compile --driver="..." lib/doctrine.compiled.php
