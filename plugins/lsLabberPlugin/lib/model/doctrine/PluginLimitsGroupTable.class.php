<?php


abstract class PluginLimitsGroupTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('LimitsGroup');
    }
}