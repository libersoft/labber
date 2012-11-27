<?php


abstract class PluginPacketPacketTable extends Doctrine_Table
{
    
    public static function getInstance()
    {
        return Doctrine_Core::getTable('PacketPacket');
    }
}