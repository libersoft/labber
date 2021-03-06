<?php

/**
 * sfGuardUser
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 * 
 * @package    phonline
 * @subpackage model
 * @author     Your name here
 * @version    SVN: $Id: Builder.php 6820 2009-11-30 17:27:49Z jwage $
 */
class sfGuardUser extends PluginsfGuardUser
{
  /**
   * Filtra tutti gli utenti non attivi
   *
   * @param <type> $event
   */
  public function preDqlSelect($event)
  {
    $params = $event->getParams();
    $field = $params['alias'] . '.is_active';
    $query = $event->getQuery();

    $query->addWhere($field . ' = 1');
  }
}
