from cassandra.cluster import Cluster
from langchain_community.vectorstores import Cassandra
from cassandra.auth import PlainTextAuthProvider
from langchain_huggingface import HuggingFaceEmbeddings


embeddings=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


cloud_config = {
    'secure_connect_bundle': 'D:/PycharmProjects/PycharmProjects/AI_Projects/DocAi/secure-connect-doctorai.zip'  # Make sure this path is correct
}

# Use the new client_id and client_secret
auth_provider = PlainTextAuthProvider("qjTApUQIQKJPreiBosBnQRED", "rWUkkyUI.i-.trJdZvGimkGuo6J6wGknEYYZbZZqmgC72BP6+y62WM1xkcOzZawqM+jv9D7KcKrydiX.qt5pOK_GAgMTLSPOdWSb,ENFmtQtUYHZGjlyitX_0WUEh,Ii")

try:
    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    session = cluster.connect()

    # Run a simple query to test the connection
    print("Connected successfully, running test query...")
    rows = session.execute("SELECT * FROM system.local")
    for row in rows:
        print(row)

except Exception as e:
    print(f"Error occurred: {e}")


# Ensure the embeddings object is properly defined
astra_vector_store = Cassandra(
    embedding=embeddings,  # The embeddings model you're using
    table_name="DoctorAI",  # The name of your table in AstraDB
    session=session,  # Pass the session object that is connected to Cassandra
    keyspace="default_keyspace"  # Use the correct keyspace from the list
)
