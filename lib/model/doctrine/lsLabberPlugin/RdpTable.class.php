<?php

/**
 * RdpTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class RdpTable extends PluginRdpTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object RdpTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Rdp');
    }
}