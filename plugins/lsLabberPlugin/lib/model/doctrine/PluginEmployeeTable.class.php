<?php


abstract class PluginEmployeeTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Employee');
    }
}