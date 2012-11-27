<?php


abstract class PluginMigrationVersionTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('MigrationVersion');
    }
}