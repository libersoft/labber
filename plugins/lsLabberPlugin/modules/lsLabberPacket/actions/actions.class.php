<?php

/**
 * Packet actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberPacket
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action packet
 */
class lsLabberPacketActions extends sfActions
{
  /**
   * Ritorna i figli di un Packet per un TreePanel asynchronous
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeGetChildren(sfWebRequest $request)
  {
    $data = $request->getParameter('_raw');
    $packet = Doctrine::getTable('Packet')->find($data[0]);
    $children = $packet->getChildren();
    
    $results = array();
    foreach ($children as $child)
    {
      $result['id'] = $child->id;
      $result['text'] = $child->name;
      if ($child->getChildren()->count() == 0)
      {
        $result['leaf'] = true;
      }
      $results[] = $result;
    }

    $this->result = $results;
    return sfView::SUCCESS;
  }

  /**
   * Associa Packet ad altri Packet
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeSetChildren(sfWebRequest $request)
  {
    $packetId = $request->getParameter('dropId');
    $newChildrenIds = $request->getParameter('dragIds');

    $packet = Doctrine::getTable('Packet')->find($packetId);
    $childrenIds = $packet->getChildren()->getPrimaryKeys();

    foreach ($newChildrenIds as $newChildrenId)
    {
      if (!in_array($newChildrenId, $childrenIds) && $newChildrenId != $packetId)
      {
        $pp = new PacketPacket();
        $pp->set('parent_packet_id', $packetId);
        $pp->set('packet_id', $newChildrenId);
        $pp->save();
      }
    }

    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }
}
