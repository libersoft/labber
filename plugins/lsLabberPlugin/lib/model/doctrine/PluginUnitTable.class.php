<?php


abstract class PluginUnitTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Unit');
    }
}