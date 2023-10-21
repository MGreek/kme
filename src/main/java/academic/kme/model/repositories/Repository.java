package academic.kme.model.repositories;

import java.util.List;

public interface Repository<TEntity, TId> {
    TId add(TEntity entity);
    void remove(TId id);
    void update(TId id, TEntity newEntity);
    TEntity get(TId id);
    List<TEntity> getAll();
}
