<?php

/**
 * PacketPacketTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class PacketPacketTable extends PluginPacketPacketTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object PacketPacketTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('PacketPacket');
    }
}