<?php


abstract class PluginLimitTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Limit');
    }
}