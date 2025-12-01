from sqlalchemy import inspect
from app.routers.places import Place


def split_database_into_parts(original_db_path="app/test.db", num_parts=5):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    # Step 1: Connect to the original database
    orig_engine = create_engine(
        f"sqlite:///{original_db_path}", connect_args={"check_same_thread": False}
    )
    OrigSession = sessionmaker(bind=orig_engine)
    orig_session = OrigSession()

    # Step 2: Get all rows from the places table
    all_places = orig_session.query(Place).order_by(Place.id).all()
    total = len(all_places)
    part_size = (total + num_parts - 1) // num_parts  # ceil division

    # Step 3: Split data and create new databases
    for i in range(num_parts):
        part_places = all_places[i * part_size : (i + 1) * part_size]
        db_name = f"app/test{i+1}.db"
        part_engine = create_engine(
            f"sqlite:///{db_name}", connect_args={"check_same_thread": False}
        )
        Place.metadata.create_all(bind=part_engine)
        PartSession = sessionmaker(bind=part_engine)
        part_session = PartSession()
        for place in part_places:
            # Detach instance from original session and add to new session
            data = {c.name: getattr(place, c.name) for c in inspect(Place).c}
            part_session.add(Place(**data))
        part_session.commit()
        part_session.close()
    orig_session.close()
    print(f"Split {total} rows into {num_parts} databases.")


# Usage:
split_database_into_parts()
