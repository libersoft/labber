<?php

/**
 * MigrationVersionTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class MigrationVersionTable extends PluginMigrationVersionTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object MigrationVersionTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('MigrationVersion');
    }
}