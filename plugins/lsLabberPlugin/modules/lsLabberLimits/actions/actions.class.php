<?php

/**
 * limits actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberLimits
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action limits
 */
class lsLabberLimitsActions extends sfActions
{
 /**
  * Lista le tabelle limiti per i commerciali.
  *
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeList(sfWebRequest $request)
  {
    try
    {
      $q = Doctrine::getTable('LimitsGroup')
        ->createQuery('g')
        ->leftJoin('g.Limits l')
        ->leftJoin('l.Denomination d')
        ->leftJoin('l.Prefix p')
        ->leftJoin('l.Unit u')
        ->select('g.id, g.name, g.certified_name, g.unconfirmed, l.id, d.name, l.denomination_alias, p.prefix, u.symbol, l.value')
        ->where('g.unconfirmed = 0')
        ->limit($request->getParameter('limit', 25))
        ->offset($request->getParameter('start', 0))
        ->orderBy(sprintf('%s %s', $request->getParameter('sort', 'name'), $request->getParameter('dir', 'ASC')))
        ->addOrderBy('l.position');

      if ($request->hasParameter('filter'))
      {
        foreach (json_decode($request->getParameter('filter')) as $filter)
        {
          $q->andWhere(sprintf("%s LIKE '%s'", $filter->field, '%'.$filter->value.'%'));
        }
      }

      foreach ($q->execute() as $group)
      {
        $g = array(
          'id' => $group->id,
          'name' => $group->name,
          'certified_name' => $group->certified_name,
        );

        foreach ($group->getLimits() as $limit)
        {
          $l = array(
            'id' => $limit->id,
            'denomination' => $limit->Denomination->name,
            'alias' => $limit->denomination_alias,
            'unit' => $limit->Prefix->prefix . $limit->Unit->symbol,
            'value' => $limit->value,
          );
          $g['limits'][] = $l;
        }

        $groups[] = $g;
      }

      $this->result = array(
        'success' => true,
        'total'   => $q->count(),
        'groups'  => $groups
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }
  }

 /**
  * Riordina i limiti.
  *
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeReorder(sfWebRequest $request)
  {
    try
    {
      $limit = Doctrine::getTable('Limit')->find($request->getParameter('limit_id'));
      $limit->moveToPosition($request->getParameter('position'));

      $this->result = array(
        'success' => true
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }

 /**
  * Copia il gruppo limite compreso di singoli limiti, senza i valori.
  *
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeCopy(sfWebRequest $request)
  {
    $groupId = $request->getParameter('group_id');

    try
    {
      $group = Doctrine::getTable('LimitsGroup')->find($groupId);
      $limits = Doctrine::getTable('Limit')->findBy('group_id', $groupId);

      $newGroup = $group->copy();

      foreach ($limits as $limit)
      {
        $newLimit = $limit->copy();
        $newLimit->setValue(null);
        $newLimit->setLimitsGroup($newGroup);
        $newLimit->save();
      }

      $newGroup->save();

      $this->result = array(
        'success' => true
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }
}
